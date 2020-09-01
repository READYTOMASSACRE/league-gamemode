import { app, DEBUG } from "../bootstrap"
import { Round } from '../entities/Round'
import { logMethod, cmdName } from "../utils"
import { commandable, command, event, eventable } from "rage-decorators"
import { WeaponManager } from "./WeaponManager"
import { singleton, autoInjectable } from "tsyringe"
import { DummyMapManager } from "./dummies/DummyMapManager"
import { PlayerManager } from "./PlayerManager"
import { RoundStatManager } from "./RoundStatManager"
import { RoundIsRunningError, RoundIsPausedError, RoundIsNotRunningError, RoundIsNotPausedError, InvalidArgumentNotify, InvalidAccessNotify } from "../errors/PlayerErrors"
import { ErrorHandler } from "../core/ErrorHandler"
import { VoteMapManager } from "./VoteMapManager"
import { GroupManager } from "./GroupManager"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"
import { DummyConfigManager } from "./dummies/DummyConfigManager"

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
    readonly dummyConfig        : DummyConfigManager,           
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
    this.clientPlayerDeath    = this.clientPlayerDeath.bind(this)
    this.playerQuit           = this.playerQuit.bind(this)
    this.roundStartCmd        = this.roundStartCmd.bind(this)
    this.roundEndCmd          = this.roundEndCmd.bind(this)
    this.voteCmd              = this.voteCmd.bind(this)
    this.voteTimeoutHandler   = this.voteTimeoutHandler.bind(this)
    this.pauseCmd             = this.pauseCmd.bind(this)
    this.unpauseCmd           = this.unpauseCmd.bind(this)
    this.addToRoundCmd        = this.addToRoundCmd.bind(this)
    this.removeFromRoundCmd   = this.removeFromRoundCmd.bind(this)
    this.playerLogin          = this.playerLogin.bind(this)
    this.mapEditorCmd         = this.mapEditorCmd.bind(this)
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
        this.playerManager.playerDeathNotify(player, reason, killer)
        this.round.playerDeath(player, reason)
        this.triggerRoundEndByPlayer(player, this.round)
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires an event when player is dead with configurable damage weapon
   * @param {PlayerMp} player victim, the player who died
   * @param {number}   reason cause hash of death
   * @param {PlayerMp} killer who killed the player
   */
  @event(SHARED.EVENTS.CLIENT_PLAYER_DEATH)
  clientPlayerDeath(player: PlayerMp, deathParams: string) {
    try {
      if (this.round && this.isRoundRunning) {
        if (this.playerManager.getState(player) === SHARED.STATE.ALIVE) {
          const { killerId, reason }  = JSON.parse(deathParams)
          const playerAt              = mp.players.at(killerId)
          const killer                = mp.players.exists(playerAt) ? playerAt : undefined

          if (killer && mp.players.exists(killer)) {
            this.roundStatManager.addKill(killer)
            this.playerManager.playerDeathNotify(player, reason, killer)
          }
        }
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
   * Event
   * 
   * Fires from the serverside when a player has logged
   * @param {PlayerMp} player 
   */
  @event([SHARED.EVENTS.SERVER_PLAYER_LOGIN_SUCCESS, SHARED.EVENTS.SERVER_PLAYER_LOGIN_FAILURE])
  playerLogin(player: PlayerMp): void {
    try {
      if (this.isRoundRunning && this.round) {
        player.call(SHARED.EVENTS.SERVER_ROUND_PlAYER_JOIN, this.round.getStartedParams())
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }


  /**
   * Command
   * 
   * Toggling map editor
   * 
   * @param {PlayerMp} player 
   * @param {string} cmdDesc 
   * @param {boolean} toggle 
   */
  @command(['me', 'mapeditor'], { desc: cmdName })
  mapEditorCmd(player: PlayerMp, cmdDesc: string, toggle?: string): void {
    try {
      if (!this.groupManager.isAdminOrRoot(player)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }

      if (this.isRoundRunning) {
        throw new InvalidAccessNotify(SHARED.MSG.ERR_ROUND_IS_RUNNING, player)
      }

      if (typeof toggle === 'undefined') {
        const lang = this.playerManager.getLang(player)
        const cmdDescText = this.lang
          .get(lang, SHARED.MSG.CMD_MAP_EDITOR)
          .replace(cmdName, cmdDesc)

        return this.playerManager.notify(player, cmdDescText)
      }

      player.call(SHARED.EVENTS.SERVER_MAP_EDITOR_TOGGLE, [toggle === 'on'])
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Commmand
   * 
   * Starts the new round
   */
  @command(['roundstart', 'rs'], { desc: cmdName })
  roundStartCmd(player: PlayerMp, cmdDesc: string, mapIdOrCode?: string): void {
    try {
      if (!this.groupManager.isAdminOrRoot(player)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }

      if (typeof mapIdOrCode === 'undefined') {
        const lang = this.playerManager.getLang(player)
        const cmdDescText = this.lang
          .get(lang, SHARED.MSG.CMD_ROUND_START)
          .replace(cmdName, cmdDesc)

        return this.playerManager.notify(player, cmdDescText)
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
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
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
  @command(["vote", "votemap"], { desc: cmdName })
  voteCmd(player: PlayerMp, cmdDesc: string, mapIdOrCode?: string): void {
    try {
      if (typeof mapIdOrCode === 'undefined') {
        const lang    = this.playerManager.getLang(player)
        const message = this.lang.get(lang, SHARED.MSG.CMD_VOTE)
        return player.outputChatBox(message.replace(cmdName, cmdDesc))
      }
  
      this.vote(player, mapIdOrCode)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Vote a map
   * @param {PlayerMp} player 
   * @param {string} mapIdOrCode 
   */
  vote(player: PlayerMp, mapIdOrCode: number | string): void {
    const firstNominate = this.voteManager.isFirstNominate
    this.voteManager.vote(player, mapIdOrCode)

    if (firstNominate && !this.voteTimer) {
      this.voteTimer = setTimeout(this.voteTimeoutHandler, this.voteManager.nominateTime)
    }
  }

  /**
   * Command
   * 
   * Pause a round
   * @param {PlayerMp} player
   * @param {string} cmdDesc
   */
  @command("pause")
  pauseCmd(player: PlayerMp, cmdDesc: string): void {
    try {
      if (!this.groupManager.isAdminOrRoot(player)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }

      this.toggleRoundPause(true, player)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Unpause round
   * @param {PlayerMp} player
   * @param {string} cmdDesc
   */
  @command("unpause")
  unpauseCmd(player: PlayerMp, cmdDesc: string): void {
    try {
      if (!this.groupManager.isAdminOrRoot(player)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }

      this.toggleRoundPause(false, player)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Add to the round a player
   * @param {PlayerMp} player
   * @param {string} cmdDesc
   * @param {string} idOrName - id or nickname an adding player
   */
  @command('add', { desc: cmdName })
  addToRoundCmd(player: PlayerMp, cmdDesc: string, idOrName?: string): void {
    try {
      if (!this.groupManager.isAdminOrRoot(player)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }

      if (!this.round || !this.round.isRunning) {
        throw new RoundIsNotRunningError(SHARED.MSG.ERR_ROUND_IS_NOT_RUNNING, player)
      }

      if (typeof idOrName === 'undefined') {
        const lang = this.playerManager.getLang(player)
        const cmdDescMessage = this.lang
          .get(lang, SHARED.MSG.CMD_ADD_TO_ROUND)
          .replace(cmdName, cmdDesc)

        return player.outputChatBox(cmdDescMessage)
      }

      const findedPlayer = this.playerManager.getPlayerByIdOrName(idOrName, player)

      if (this.round.hasPlayer(findedPlayer)) {
        throw new InvalidArgumentNotify(SHARED.MSG.ERR_PLAYER_IN_ROUND, player, findedPlayer.name)
      }

      if (this.round.addToRound(findedPlayer)) {
        mp.players.forEach(player => {
          this.playerManager.success(player, SHARED.MSG.ROUND_ADD_TO_ROUND_SUCCESS, findedPlayer.name)
        })
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Remove from the round a player
   * @param {PlayerMp} player
   * @param {string} cmdDesc
   * @param {string} idOrName - id or nickname an adding player
   */
  @command('remove', { desc: cmdName })
  removeFromRoundCmd(player: PlayerMp, cmdDesc: string, idOrName?: string): void {
    try {
      if (!this.groupManager.isAdminOrRoot(player)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }

      if (!this.round || !this.round.isRunning) {
        throw new RoundIsNotRunningError(SHARED.MSG.ERR_ROUND_IS_NOT_RUNNING, player)
      }

      if (typeof idOrName === 'undefined') {
        const lang = this.playerManager.getLang(player)
        const cmdDescMessage = this.lang
          .get(lang, SHARED.MSG.CMD_REMOVE_FROM_ROUND)
          .replace(cmdName, cmdDesc)

        return player.outputChatBox(cmdDescMessage)
      }

      const findedPlayer = this.playerManager.getPlayerByIdOrName(idOrName, player)

      if (!this.round.hasPlayer(findedPlayer)) {
        throw new InvalidArgumentNotify(SHARED.MSG.ERR_PLAYER_NOT_IN_ROUND, player, findedPlayer.name)
      }
      if (this.round.removeFromRound(findedPlayer)) {
        mp.players.forEach(player => {
          this.playerManager.success(player, SHARED.MSG.ROUND_REMOVE_FROM_ROUND_SUCCESS, findedPlayer.name)
        })
      }
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

    const effects = this.dummyConfig.getEffects()

    /* create a new round */
    this.round = new Round({
      roundTimeInterval   : RoundManager.ROUND_TIME_INTERVAL,
      lobby               : RoundManager.LOBBY,
      mapId               : this.dummyMapManager.loadMap(mapIdOrCode, player || players).id,
      weaponSet           : this.weaponManager.weaponSet,
      dimension           : { round: RoundManager.ROUND_DIMENSION, lobby: RoundManager.LOBBY_DIMENSION },
      dummyMapManager     : this.dummyMapManager,
      players             : players,
      playerManager       : this.playerManager,
      prepareTime         : effects.ROUND.PLAYING_SECONDS * 1000
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
   * Toggle round pause if round is running
   * @param {boolean} toggle - flag to turn on/off pause
   * @param {PlayerMp} notifiedPlayer - (optional) a notified player about an error
   */
  toggleRoundPause(toggle: boolean, notifiedPlayer?: PlayerMp): void {
    if (!this.round || !this.round.isRunning) {
      throw new RoundIsNotRunningError(SHARED.MSG.ERR_ROUND_IS_NOT_RUNNING, notifiedPlayer)
    }

    if (toggle === true && this.round.isPaused) {
      throw new RoundIsPausedError(SHARED.MSG.ERR_ROUND_IS_PAUSED, notifiedPlayer)
    } else if (toggle === false && !this.round.isPaused) {
      throw new RoundIsNotPausedError(SHARED.MSG.ERR_ROUND_IS_UNPAUSED, notifiedPlayer)
    }

    return this.round.togglePause(toggle)
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