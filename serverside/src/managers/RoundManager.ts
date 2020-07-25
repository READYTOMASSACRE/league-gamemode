import { app, DEBUG } from "../bootstrap"
import { Round } from '../entities/Round'
import { logMethod } from "../utils"
import { commandable, command, event, eventable } from "rage-decorators"
import { WeaponManager } from "./WeaponManager"
import { singleton, autoInjectable, inject } from "tsyringe"
import { DummyMapManager } from "./dummies/DummyMapManager"
import { PlayerManager } from "./PlayerManager"
import { RoundStatManager } from "./RoundStatManager"
import { RoundIsRunningError, InvalidAccessNotify } from "../errors/PlayerErrors"
import { ErrorHandler } from "../core/ErrorHandler"
import { VoteMapManager } from "./VoteMapManager"
import { GroupManager } from "./GroupManager"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"

const [x, y, z] = app.getConfig().get('LOBBY')

/**
 * Class to manage the round
 */
@singleton()
@autoInjectable()
@commandable()
@eventable()
class RoundManager {
  static readonly ROUND_TIME_INTERVAL: number = app.getConfig().get('ROUND_TIME_INTERVAL_MINUTES') * 60 * 1000
  static readonly LOBBY: Vector3Mp = new mp.Vector3(x, y, z)
  static readonly LOBBY_DIMENSION = 0
  static readonly ROUND_DIMENSION = 1

  round?: Round
  private voteTimer?: NodeJS.Timeout

  constructor(
    readonly dummyMapManager    : DummyMapManager,
    readonly weaponManager      : WeaponManager,
    readonly playerManager      : PlayerManager,
    readonly roundStatManager   : RoundStatManager,
    readonly voteManager        : VoteMapManager,
    readonly groupManager       : GroupManager,
    readonly errHandler         : ErrorHandler,
    readonly lang               : DummyLanguageManager
  ) {
    this.playerDeath          = this.playerDeath.bind(this)
    this.playerQuit           = this.playerQuit.bind(this)
    this.roundStartCmd        = this.roundStartCmd.bind(this)
    this.roundEndCmd          = this.roundEndCmd.bind(this)
    this.voteCmd              = this.voteCmd.bind(this)
    this.voteTimeoutHandler   = this.voteTimeoutHandler.bind(this)
  }

  /**
   * Event
   * 
   * Fires an event when player is dead
   * @param {PlayerMp} player victim, the player who died
   * @param {number}   reason cause hash of death
   * @param {PlayerMp} killer who killed the player
   */
  @event(RageEnums.EventKey.PLAYER_DEATH)
  playerDeath(player: PlayerMp, reason: number, killer?: PlayerMp) {
    try {
      if (this.round && this.isRoundRunning) {
        if (this.playerManager.getState(player) === SHARED.STATE.ALIVE) {
          if (killer) this.roundStatManager.addKill(killer)
          this.roundStatManager.addDeath(player)
        }
        this.round.playerDeath(player, reason, killer)
        this.triggerRoundEndByPlayer(player, this.round)
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires an event when the player has left
   * to remove them from a round if they are in it
   * @param {PlayerMp} player 
   * @param {string} exitType 
   * @param {string} reason 
   */
  @event(RageEnums.EventKey.PLAYER_QUIT)
  playerQuit(player: PlayerMp, exitType: "disconnect" | "timeout" | "kicked", reason: string): void {
    try {
      if (this.round && this.isRoundRunning) {
        this.round.playerQuit(player, exitType, reason)
        this.triggerRoundEndByPlayer(player, this.round)
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Commmand
   * 
   * Starts the new round
   */
  @command(['roundstart', 'rs'])
  roundStartCmd(player: PlayerMp, _: string, mapIdOrCode: string): void {
    try {
      if (!this.groupManager.isAdminOrRoot(player)) {
        const lang = this.playerManager.getLang(player)
        const message = this.lang.get(lang, SHARED.MSG.GROUP_ERR_WRONG_ACCESS)
        throw new InvalidAccessNotify(message, player)
      }

      this.roundStart(mapIdOrCode, player)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Commmand
   * 
   * End the round
   * @param {PlayerMp} player
   */
  @logMethod(DEBUG)
  @command(['roundend', 're'])
  roundEndCmd(player: PlayerMp): void {
    try {
      if (!this.groupManager.isAdminOrRoot(player)) {
        const lang = this.playerManager.getLang(player)
        const message = this.lang.get(lang, SHARED.MSG.GROUP_ERR_WRONG_ACCESS)
        throw new InvalidAccessNotify(message, player)
      }

      this.roundEnd()
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Vote for the map
   * @param {PlayerMp} player
   * @param {string} cmdDesc
   * @param {string} mapIdOrCode - the choice of a player
   */
  @command(["vote", "votemap"], { desc: '{{cmdName}}' })
  voteCmd(player: PlayerMp, cmdDesc: string, mapIdOrCode?: string): void {
    try {
      if (typeof mapIdOrCode === 'undefined') {
        const lang = this.playerManager.getLang(player)
        const message = this.lang.get(lang, SHARED.MSG.CMD_DESC_VOTE)
        return player.outputChatBox(message.replace('{{cmdName}}', cmdDesc))
      }
  
      if (
        this.voteManager.isFirstNominate
        && !this.voteTimer
      ) {
        this.voteTimer = setTimeout(this.voteTimeoutHandler, this.voteManager.nominateTime)
      }
      this.voteManager.vote(player, mapIdOrCode)


    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Invoke a start of the round
   * 
   * @param {string} mapIdOrCode
   * 
   * @throws {RoundIsRunningError}
   */
  roundStart(mapIdOrCode: string, player?: PlayerMp): boolean {
    const players = this.playerManager.getEntitiesWithState(SHARED.STATE.IDLE)

    if (this.isRoundRunning) {
      throw new RoundIsRunningError(SHARED.MSG.ERR_ROUND_IS_RUNNING, player || players)
    }

    /* clear the vote timer if exists */
    if (this.voteTimer) {
      clearTimeout(this.voteTimer)
      this.voteTimer = undefined
    }

    /* create a new round */
    this.round = new Round({
      roundTimeInterval: RoundManager.ROUND_TIME_INTERVAL,
      lobby:             RoundManager.LOBBY,
      mapId:             this.dummyMapManager.loadMap(mapIdOrCode, player || players).id,
      weaponSet:         this.weaponManager.weaponSet,
      dimension:         { round: RoundManager.ROUND_DIMENSION, lobby: RoundManager.LOBBY_DIMENSION },
      dummyMapManager:   this.dummyMapManager,
      players:           players,
      playerManager:     this.playerManager,
    })

    this.round.start()

    return true
  }

  /**
   * Invoke an end of the round
   */
  @logMethod(DEBUG)
  roundEnd(): boolean {
    /* invoke ending of the round */
    if (this.round && this.isRoundRunning) {
      this.round.end()
      return true
    }

    return false
  }

  /**
   * Triggers when the player thinks that round should be ended
   * @param {PlayerMp} player 
   * @param {Round} round 
   */
  triggerRoundEndByPlayer(player: PlayerMp, round: Round) {
    const teamId = this.playerManager.getTeam(player)

    if (!round.hasAlivePlayers(teamId)) this.roundEnd()
  }

  /**
   * Start a timeout of voting
   */
  voteTimeoutHandler(): void {
    try {
      const map = this.voteManager.getWinner()
  
      this.voteManager.stop()
      this.roundStart(map.toString())
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Check if the round is running
   */
  get isRoundRunning(): boolean {
    return this.round instanceof Round && this.round.isRunning
  }
}

export { RoundManager }