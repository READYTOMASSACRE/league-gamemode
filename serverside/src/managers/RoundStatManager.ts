import { singleton, autoInjectable } from "tsyringe"
import { event, eventable } from "rage-decorators"
import { DummyPlayerRoundStatManager } from "./dummies/DummyPlayerRoundStatManager"
import { logMethod, formatDate } from "../utils"
import { DEBUG } from "../bootstrap"
import { PlayerManager } from "./PlayerManager"
import { PlayerProfileManager } from "./PlayerProfileManager"
import { RoundStatUpdateError } from "../errors/PlayerErrors"
import { ErrorHandler } from "../core/ErrorHandler"
import { DummyRoundStatManager } from "./dummies/DummyRoundStatManager"
import { Round, RoundKeyValueCollection } from "../db/entity/Round"
import { RoundRepository } from "../db/repos/RoundRepository"
import { getCustomRepository } from "typeorm"
import { DomainConverter } from "../db/entity/DomainConverter"
import { InvalidTypeError } from "../errors/LogErrors"
import { DummyConfigManager } from "./dummies/DummyConfigManager"

type RoundHistory = {
  result: string
  date: string
  kda: string
}

/**
 * Class to manage round stats
 */
@singleton()
@eventable()
@autoInjectable()
class RoundStatManager {
  /** @todo get data from config */
  static readonly ASSIST_SECONDS_EXPIRED = 15

  public  repository?   : RoundRepository
  private entity?       : Round

  constructor(
    readonly dummyConfig              : DummyConfigManager,
    readonly dummyStatManager         : DummyPlayerRoundStatManager,
    readonly playerManager            : PlayerManager,
    readonly playerStatManager        : PlayerProfileManager,
    readonly errHandler               : ErrorHandler,
    readonly dummyRoundStatManager    : DummyRoundStatManager,
  ) {
    this.roundStart               = this.roundStart.bind(this)
    this.roundEnd                 = this.roundEnd.bind(this)
    this.playerRoundStatUpdate    = this.playerRoundStatUpdate.bind(this)
    this.assistUpdate             = this.assistUpdate.bind(this)
    this.playerAdd                = this.playerAdd.bind(this)
  }

  load(): void {
    this.repository = getCustomRepository(RoundRepository)
  }

  @event(SHARED.EVENTS.SERVER_ROUND_START)
  roundStart(startDate: Date, players: PlayerMp[]): void {
    this.entity = Round.create(+startDate, players)
  }

  /**
   * Event
   * 
   * Triggers when the round is ended
   * @param teamWinner - id of team winner
   */
  @event(SHARED.EVENTS.SERVER_ROUND_END)
  async roundEnd(teamWinner: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS | false): Promise<void> {
    try {
      if (!this.entity) throw new InvalidTypeError("Round entity is not exists")

      this.entity.setWinner(teamWinner)
      this.dummyRoundStatManager.setWinner(teamWinner)

      if (this.repository) {
        const players = [...this.entity.state.ATTACKERS, ...this.entity.state.DEFENDERS]
        await Promise.all([
          this.playerStatManager.saveStats(players, teamWinner),
          this.repository.save(this.entity),
        ])
      }

      if (teamWinner) {
        mp.players.call(SHARED.EVENTS.SERVER_ROUND_TEAMSCORE, [{ [teamWinner]: this.dummyRoundStatManager.getTeamScore(teamWinner) }])
      }
  
      delete this.entity
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Update player stats
   * Triggered from clientside when the data should be updated
   * 
   * @param player player which data should be updated
   * @param key - key of round stat dto
   * @param value - updated data
   */
  @event(SHARED.EVENTS.CLIENT_ROUND_STAT_UPDATE)
  playerRoundStatUpdate<K extends keyof RoundKeyValueCollection>(player: PlayerMp, key: K, value: SHARED.TYPES.PlayerRoundStatDTO[K]): void {
    try {
      if (!this.entity) {
        throw new RoundStatUpdateError(SHARED.MSG.ERR_ROUND_IS_NOT_RUNNING, player)
      }
      
      if (player.sharedData.state !== SHARED.STATE.ALIVE || typeof key !== 'string') {
        throw new RoundStatUpdateError(
          SHARED.MSG.ERR_INVALID_PLAYER_STATE,
          player
        )
      }
  
      const data = this.prepareParams(key, value)
  
      const update = !!Object
        .entries(data)
        .filter(([dtoKey, dtoValue]) => {
          return this.entity!.updatePlayerRoundData(player, dtoKey as K, dtoValue as SHARED.TYPES.PlayerRoundStatDTO[K])
        }).length
  
      if (update) {
        if (!data.id) data.id = player.id
        this.dummyStatManager.update(data)
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when the client need to update assist
   * @param {PlayerMp} player 
   * @param {string} assist - JSON string of assit players
   */
  @logMethod(DEBUG)
  @event(SHARED.EVENTS.CLIENT_ASSIST_UPDATE)
  assistUpdate(player: PlayerMp, assist: string): void {
    try {
      if (!this.playerManager.hasState(player, [SHARED.STATE.ALIVE, SHARED.STATE.DEAD])) return
  
      const data: { [key: number]: number } = this.prepareParams(assist)
      const dateNow = Date.now()
  
      Object.entries(data)
        .forEach(([id, expire]) => {
          const expired = Math.round((dateNow - expire)/1000) > RoundStatManager.ASSIST_SECONDS_EXPIRED
  
          if (expired) return
  
          const assistPlayer = mp.players.at(+id)
          if (assistPlayer && this.playerManager.hasState(assistPlayer, [SHARED.STATE.ALIVE, SHARED.STATE.DEAD])) {
            this.playerRoundStatUpdate(assistPlayer, "assist", 1)
          }
        })
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires from the serverside when a player has been added to the round
   * @param {PlayerMp} player 
   */
  @event(SHARED.EVENTS.SERVER_ROUND_PLAYER_ADD)
  playerAdd(player: PlayerMp): void {
    try {
      if (this.entity) this.entity.updatePlayerTeam(player)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Adding a new death to the player round stats
   * @param {PlayerMp} player 
   */
  addDeath(player: PlayerMp) {
    this.playerRoundStatUpdate(player, "death", 1)
  }

  /**
   * Adding a new kill to the player round stats
   * @param {PlayerMp} player 
   */
  addKill(player: PlayerMp) {
    this.playerRoundStatUpdate(player, "kill", 1)
  }

  /**
   * Get all matches in the last week
   * @param {PlayerMp} player
   */
  async getMatchesLastWeek(player: PlayerMp): Promise<RoundHistory[]> {
    try {
      if (!this.repository) return []

      const matches = await this.repository.getMatchesLastWeek(player.rgscId)
      const lang = this.playerManager.getLang(player)

      return matches.map(match => this.formatCefMatch(player, match, lang))
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }

    return []
  }

  formatCefMatch(player: PlayerMp, round: Round, lang?: string): any {
    if (typeof lang === 'undefined') {
      lang = this.playerManager.getLang(player)
    }

    let result = 'Lost'
    
    if (round.isDraw()) {
      result = 'Draw'
    } else if(round.isPlayerWinner(player)) {
      result = 'Won'
    }

    const [k, d, a] = round.getPlayerKDA(player)
    const date = formatDate(round.created_at, lang)

    return {
      id: round.id,
      result,
      date,
      kda: `${k}/${d}/${a}`
    }
  }

  formatCefMatchDetail(player: PlayerMp, dto: SHARED.TYPES.RoundStatDTO, lang?: string): any {
    if (typeof lang === 'undefined') {
      lang = this.playerManager.getLang(player)
    }

    const att = this.dummyConfig.getTeamData(SHARED.TEAMS.ATTACKERS)
    const def = this.dummyConfig.getTeamData(SHARED.TEAMS.DEFENDERS)

    return {
      winner: dto.winner,
      created_at: formatDate(dto.created_at, lang),
      [SHARED.TEAMS.ATTACKERS]: {
        name: att.NAME,
        color: att.COLOR,
        players: dto[SHARED.TEAMS.ATTACKERS],
      },
      [SHARED.TEAMS.DEFENDERS]: {
        name: def.NAME,
        color: def.COLOR,
        players: dto[SHARED.TEAMS.DEFENDERS],
      }
    }
  }

  /**
   * Get the round stat domain
   * @param {SHARED.TYPES.RoundStatDTO} dto 
   */
  getDomain(dto: SHARED.TYPES.RoundStatDTO): Round {
    return DomainConverter.fromDto(Round, dto)
  }

  /**
   * Prepare params from the client to parse them in to update
   * @param {string} key 
   * @param {any} value 
   */
  private prepareParams(key: string, value?: any): any {
    let payload = {}
    if (typeof value === 'undefined' && key) {
      try {
        payload = JSON.parse(key)
      } catch (err) {
        console.error(err)
      }
    } else {
      try {
        payload = { [key]: JSON.parse(value) }
      } catch (err) {
        payload = { [key]: value }
      }
    }

    return payload
  }
}

export { RoundStatManager }