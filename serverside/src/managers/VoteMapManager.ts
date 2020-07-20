import { singleton, autoInjectable, inject } from "tsyringe"
import { DummyMapManager } from "./dummies/DummyMapManager"
import { Config } from "../core/Config"
import { RoundManager } from "./RoundManager"
import { getRandomInt } from "../utils"
import { commandable, command } from "rage-decorators"
import { PlayerManager } from "./PlayerManager"
import { VoteError, VoteAddError } from "../errors/PlayerErrors"

type NominateMapInfo = {
  id: number
  owner: number
  vote: number[]
}

type NominateMaps = {
  [key: number]: NominateMapInfo
}

/**
 * Class to manage the voting players
 */
@singleton()
@commandable()
@autoInjectable()
class VoteMapManager {
  private nominate: NominateMaps = {}
  private maxNominate: number
  private nominateTime: number
  private timeout?: NodeJS.Timeout

  constructor(
    @inject(Config) private readonly config: Config,
    private readonly dummyMapManager: DummyMapManager,
    private readonly playerManager: PlayerManager,
    private readonly roundManager: RoundManager,
  ) {
    const { TIME, MAX_NOMINATE }  = this.config.get("VOTE")
    this.maxNominate              = MAX_NOMINATE
    this.nominateTime             = TIME * 1000
    this.stop                     = this.stop.bind(this)
    this.voteCmd                  = this.voteCmd.bind(this)
  }

  /**
   * @todo handle command descriptions with languageManager in clientside
   * Command
   * 
   * Vote for the map
   * @param {PlayerMp} player
   * @param {string} cmdDesc
   * @param {string} mapIdOrCode - the choice of a player
   */
  @command(["vote", "votemap"], { desc: SHARED.MSG.CMD_DESC_VOTE })
  voteCmd(player: PlayerMp, cmdDesc: string, mapIdOrCode?: string): void {
    try {
      if (typeof mapIdOrCode === 'undefined') {
        return player.outputChatBox(cmdDesc)
      }
  
      return this.vote(player, mapIdOrCode)
    } catch (err) {
      if (!this.roundManager.errHandler.handle(err)) throw err
    }
  }

  /**
   * Make the vote to a map
   * @param {PlayerMp} player 
   * @param {string | number} mapIdOrCode - the choice of a player
   */
  vote(player: PlayerMp, mapIdOrCode: string | number) {
    if (this.playerManager.getState(player) !== SHARED.STATE.IDLE) {
      throw new VoteError(SHARED.MSG.ERR_INVALID_PLAYER_STATE, player)
    }

    const maps = this.dummyMapManager.getMaps(mapIdOrCode)

    if (!maps.length) {
      throw new VoteError(SHARED.MSG.ERR_NOT_FOUND, player)
    }

    if (maps.length > 1) {
      const mapNames = maps.map(dummy => dummy.data.code).join(", ")
      throw new VoteError(SHARED.MSG.ERR_TOO_MANY_MAPS, player, mapNames)
    }

    const [ map ] = maps

    if (this.hasPlayerAlreadyVoted(player, map.data.id)) {
      throw new VoteError(SHARED.MSG.ERR_PLAYER_HAS_ALREADY_VOTED, player)
    }

    if (!this.hasNominated(map.data.id) && this.hasMaxNominated()) {
      throw new VoteError(SHARED.MSG.ERR_VOTEMAP_MAX_NOMINATED, player)
    }

    if (!this.add(player, map.data.id)) {
      throw new VoteAddError(SHARED.MSG.ERR_VOTEMAP_HAS_NOT_ADDED, player)
    }

    if (this.isFirstNominate()) {
      this.timeout = setTimeout(this.stop, this.nominateTime)

      mp.players.forEach(player => player.call(SHARED.EVENTS.SERVER_VOTEMAP_START, []))
    }
  }

  /**
   * Stop the voting
   */
  stop(): void {
    try {
      const mapId = this.getWinner()
      this.roundManager.roundStart(mapId.toString())
  
      this.refresh()
    } catch (err) {
      if (this.roundManager.errHandler.handle(err)) throw err
    }
  }

  /**
   * Get winner
   */
  getWinner(): number {
    const maxVote = this.getMaxVote()
    const maps = this
      .toArray()
      .filter(mapInfo => mapInfo.vote.length === maxVote)

    return maps[getRandomInt(maps.length)].id
  }

  /**
   * Get max voted map
   */
  getMaxVote(): number {
    let maxVote = 0
    this.toArray().forEach(mapInfo => {
      maxVote = maxVote > mapInfo.vote.length && maxVote || mapInfo.vote.length
    })

    return maxVote
  }

  /**
   * Has map nominated
   * 
   * @param {number} id - map id
   */
  hasNominated(id: number): boolean {
    return typeof this.nominate[id] !== 'undefined'
  }

  /**
   * Has the player already voted
   * @param {PlayerMp} player 
   * @param {number} id - map id
   */
  hasPlayerAlreadyVoted(player: PlayerMp, id: number): boolean {
    return this.nominate[id] && (this.nominate[id].owner === player.id || this.nominate[id].vote.indexOf(player.id) !== -1)
  }

  /**
   * Adding a new vote
   * @param {PlayerMp} player 
   * @param {number} id - map id
   */
  add(player: PlayerMp, id: number): boolean {
    if (!this.hasNominated(id)) {
      this.nominate[id] = {
        id,
        vote: [player.id],
        owner: player.id,
      }
    } else {
      this.nominate[id].vote.push(player.id)
    }

    return true
  }

  /**
   * Is this first nominate map
   */
  isFirstNominate(): boolean {
    return this.size === 1
  }

  /**
   * Refresh nominate
   */
  refresh(): void {
    this.nominate = {}
    if (this.timeout) clearTimeout(this.timeout)
  }

  /**
   * Has already max nominated
   */
  hasMaxNominated(): boolean {
    return this.size === this.maxNominate
  }

  /**
   * Pass to array
   */
  toArray(): NominateMapInfo[] {
    return Object.values(this.nominate)
  }

  /**
   * Get nominate size
   */
  get size(): number {
    return Object.keys(this.nominate).length
  }
}

export { VoteMapManager }