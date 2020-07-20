import { app, DEBUG } from "../bootstrap"
import { Round } from '../entities/Round'
import { logMethod } from "../utils"
import { commandable, command, event, eventable } from "rage-decorators"
import { WeaponManager } from "./WeaponManager"
import { singleton, autoInjectable, inject } from "tsyringe"
import { DummyMapManager } from "./dummies/DummyMapManager"
import { PlayerManager } from "./PlayerManager"
import { RoundStatManager } from "./RoundStatManager"
import { RoundIsRunningError } from "../errors/PlayerErrors"
import { ErrorHandler } from "../core/ErrorHandler"

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

  constructor(
    readonly dummyMapManager: DummyMapManager,
    readonly weaponManager: WeaponManager,
    readonly playerManager: PlayerManager,
    readonly roundStatManager: RoundStatManager,
    @inject(ErrorHandler) readonly errHandler: ErrorHandler
  ) {
    this.playerDeath    = this.playerDeath.bind(this)
    this.playerQuit     = this.playerQuit.bind(this)
    this.roundStartCmd  = this.roundStartCmd.bind(this)
    this.roundEndCmd    = this.roundEndCmd.bind(this)
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
   * @todo add admin privilege
   * Commmand
   * 
   * Starts the new round
   */
  @command(['roundstart', 'rs'])
  roundStartCmd(player: PlayerMp, _: string, mapIdOrCode: string): void {
    try {
      this.roundStart(mapIdOrCode, player)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * @todo add admin privilege
   * Commmand
   * 
   * End the round
   */
  @logMethod(DEBUG)
  @command(['roundend', 're'])
  roundEndCmd(): void {
    try {
      this.roundEnd()
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
  roundStart(mapIdOrCode: string, player?: PlayerMp): void {
    const players = this.playerManager.getEntitiesWithState(SHARED.STATE.IDLE)

    if (this.isRoundRunning) {
      throw new RoundIsRunningError(SHARED.MSG.ERR_ROUND_IS_RUNNING, player || players)
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
  }

  /**
   * Invoke an end of the round
   */
  @logMethod(DEBUG)
  roundEnd(): void {
    /* invoke ending of the round */
    if (this.round && this.isRoundRunning) this.round.end()
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
   * Check if the round is running
   */
  get isRoundRunning(): boolean {
    return this.round instanceof Round && this.round.isRunning
  }
}

export { RoundManager }