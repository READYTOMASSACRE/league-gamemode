import { singleton, autoInjectable } from "tsyringe"
import { event, eventable } from "rage-decorators"
import { RoundStat, RoundKeyValueCollection } from "../db/domains/RoundStat"
import { RoundStatRepo } from "../db/repos/RoundStatRepo"
import { DummyPlayerRoundStatManager } from "./dummies/DummyPlayerRoundStatManager"
import { logMethod, formatDate } from "../utils"
import { DEBUG } from "../bootstrap"
import { PlayerManager } from "./PlayerManager"
import { PlayerProfileManager } from "./PlayerProfileManager"
import { RoundStatUpdateError } from "../errors/PlayerErrors"
import { ErrorHandler } from "../core/ErrorHandler"
import { DummyRoundStatManager } from "./dummies/DummyRoundStatManager"
import { DomainConverter } from "../db/domains/DomainConverter"

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

  private _roundStat?: RoundStat

  constructor(
    readonly repo: RoundStatRepo,
    readonly dummyStatManager: DummyPlayerRoundStatManager,
    readonly playerManager: PlayerManager,
    readonly playerStatManager: PlayerProfileManager,
    readonly errHandler: ErrorHandler,
    readonly dummyRoundStatManager: DummyRoundStatManager,
  ) {
    this.roundStart               = this.roundStart.bind(this)
    this.roundEnd                 = this.roundEnd.bind(this)
    this.playerRoundStatUpdate    = this.playerRoundStatUpdate.bind(this)
    this.assistUpdate             = this.assistUpdate.bind(this)
  }

  @event(SHARED.EVENTS.SERVER_ROUND_START)
  roundStart(startDate: Date, players: PlayerMp[]): void {
    this._roundStat = RoundStat.create(+startDate, players)
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
      this.roundStat.setWinner(teamWinner)
      this.dummyRoundStatManager.setWinner(teamWinner)

      const players = [...this.roundStat.state.ATTACKERS, ...this.roundStat.state.DEFENDERS]
      await Promise.all([
        this.playerStatManager.saveStats(players, teamWinner),
        this.roundStat.save(this.repo),
      ])
  
      delete this._roundStat
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
          return this.roundStat.updatePlayerRoundData(player, dtoKey as K, dtoValue as SHARED.TYPES.PlayerRoundStatDTO[K])
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
      const matches = await this.repo.getMatchesLastWeekByPlayer(player)
      const lang = this.playerManager.getLang(player)

      return matches.map(match => {
        const roundStat = this.getDomain(match)
        let result = 'Lost'
        
        if (roundStat.isDraw()) {
          result = 'Draw'
        } else if(roundStat.isPlayerWinner(player)) {
          result = 'Won'
        }
  
        const [k, d, a] = roundStat.getPlayerKDA(player)
        const date = formatDate(match.created_at, lang)

        return {
          result,
          date,
          kda: `${k}/${d}/${a}`
        }
      })
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }

    return []
  }

  /**
   * Get the round stat domain
   * @param {SHARED.TYPES.RoundStatDTO} dto 
   */
  getDomain(dto: SHARED.TYPES.RoundStatDTO): RoundStat {
    return DomainConverter.fromDto(RoundStat, dto)
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

  get roundStat(): RoundStat {
    if (!this._roundStat) throw new TypeError("Invalid round stat")

    return this._roundStat
  }
}

export { RoundStatManager }