import { Zone } from '../entities/Zone'
import { GameMapManager } from './GameMapManager'
import { ZoneManager } from './ZoneManager'
import { DialogManager } from './DialogManager'
import { singleton, autoInjectable } from 'tsyringe'
import { DummyMapManager } from './dummies/DummyMapManager'
import { DummyConfigManager } from './dummies/DummyConfigManager'
import { event, eventable, command, commandable } from 'rage-decorators'
import { ErrorHandler } from '../core/ErrorHandler'
import { HudManager } from './HudManager'
import { InfoPanel } from '../hud/RoundInfo'
import { PlayerManager } from './PlayerManager'
import { DummyLanguageManager } from './dummies/DummyLanguageManager'
import { DummyRoundStatManager } from './dummies/DummyRoundStatManager'
import { NotFoundNotifyError } from '../errors/PlayerErrors'
import { InteractionManager } from './InteractionManager'

/**
 * Class to manage the round
 */
@singleton()
@eventable()
@commandable()
@autoInjectable()
class RoundManager {
  public map?         : TYPES.GameMap
  public zone?        : Zone

  private isRunning   : boolean = false

  constructor(
    readonly mapManager           : GameMapManager,
    readonly zoneManager          : ZoneManager,
    readonly dialogManager        : DialogManager,
    readonly dummyMapManager      : DummyMapManager,
    readonly dummyConfigManager   : DummyConfigManager,
    readonly errHandler           : ErrorHandler,
    readonly hudManager           : HudManager,
    readonly playerManager        : PlayerManager,
    readonly lang                 : DummyLanguageManager,
    readonly statManager          : DummyRoundStatManager,
    readonly interactionManager   : InteractionManager,
  ) {
    this.prepare          = this.prepare.bind(this)
    this.start            = this.start.bind(this)
    this.end              = this.end.bind(this)
    this.pause            = this.pause.bind(this)
    this.teamscore        = this.teamscore.bind(this)
    this.remove           = this.remove.bind(this)
    this.deathOrRemove    = this.deathOrRemove.bind(this)
    this.spectate         = this.spectate.bind(this)
    this.playerJoin       = this.playerJoin.bind(this)
  }

  /**
   * Event
   * 
   * Fires when the round has start the prepared timer
   * @param {number} mapId - the id of map
   */
  @event(SHARED.EVENTS.SERVER_ROUND_PREPARE)
  prepare(mapId?: number): void {
    try {
      if (typeof mapId === 'undefined') {
        throw new NotFoundNotifyError(SHARED.MSG.ERR_NOT_FOUND)
      }

      this.map        = this.dummyMapManager.loadMap(mapId)
      this.zone       = new Zone(this.map)
      this.isRunning  = true

      this.playerManager.freeze(true)
      this.hudManager.roundStartEffect.start(this.map.code, this.zone.center())
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when the round has started
   * @param {number} mapId - the id of map
   */
  @event([SHARED.EVENTS.SERVER_ROUND_START, SHARED.EVENTS.SERVER_ROUND_PLAYER_ADD])
  start(mapId: number, playerIds: number[], timePassedMs: number): void {
    try {
      if (!this.map) this.map = this.dummyMapManager.loadMap(mapId)
      if (!this.zone) this.zone = new Zone(this.map)

      this.mapManager.drawZone(this.map)
      this.zoneManager.inspect(this.zone)
      const config    = this.dummyConfigManager.dummy
      this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_WEAPON_DIALOG_OPEN, config.data.WEAPON_SET)
      this.playerManager.freeze(false)
      this.enableRoundHud(timePassedMs, playerIds)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when the round has ended
   */
  @event(SHARED.EVENTS.SERVER_ROUND_END)
  end(winner?: SHARED.TEAMS): void {
    try {
      this.hudManager.roundStopEffect.start(winner)
      this.interactionManager.getSpectate().setPlayersVisible()
      this.hudManager.roundInfo.roundStop()

      this.isRunning = false
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires a player has been removed from the round
   */
  @event([SHARED.EVENTS.SERVER_ROUND_PLAYER_REMOVE, SHARED.EVENTS.SERVER_ROUND_PLAYER_DEATH, SHARED.EVENTS.SERVER_ROUND_END])
  remove(): void {
    try {
      this.mapManager.clearZone()
      this.zoneManager.stopInspect()
      this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_WEAPON_DIALOG_CLOSE)
      this.disableRoundHud()

      this.playerManager.freeze(false)

      this.map = undefined
      this.zone = undefined
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires a player has been removed from the round
   */
  @event([SHARED.EVENTS.SERVER_ROUND_PLAYER_REMOVE, SHARED.EVENTS.SERVER_ROUND_PLAYER_DEATH])
  deathOrRemove(): void {
    try {
      // this.interactionManager.getSpectate().enable()
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }



  /**
   * Event
   * 
   * Fires when a player has connected to the server
   */
  @event(SHARED.EVENTS.SERVER_ROUND_PlAYER_JOIN)
  playerJoin(mapId: number, playerIds: number[], timePassedMs: number): void {
    try {
      if (!this.map) this.map = this.dummyMapManager.loadMap(mapId)

      const data = this.getRoundInfoData(this.map, playerIds)
      this.hudManager.roundInfo.roundStart(data, timePassedMs)

      this.isRunning = true
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Enable round hud
   * @param {TYPES.GameMap} map - current map
   * @param {number[]} playerIds - current players in the round
   * @param {number} roundTimeIntervalMs - time of the round in miliseconds
   */
  enableRoundHud(timePassedMs: number, playerIds: number[] = []): void {
    this.hudManager.votemapNotify.stop()
    this.hudManager.roundStopEffect.stop()
    this.hudManager.damage.start()
    this.interactionManager.getSpectate().disable()
    this.hudManager.spectateViewers.start()

    if (this.map) {
      const data = this.getRoundInfoData(this.map, playerIds)
      this.hudManager.roundInfo.roundStart(data, timePassedMs)
    }
  }

  /**
   * Disable round hud
   */
  disableRoundHud(): void {
    this.hudManager.damage.stop()
    this.hudManager.roundStartEffect.stop()
    this.hudManager.spectateViewers.stop()
    this.interactionManager.getSpectate().disable()
  }

  /**
   * Event
   * 
   * Fires when a client need to update a teamscore
   */
  @event(SHARED.EVENTS.SERVER_ROUND_TEAMSCORE)
  teamscore(score: { ATTACKERS?: number, DEFENDERS?: number }): void {
    try {
      const { ATTACKERS, DEFENDERS } = score
  
      if (ATTACKERS) this.hudManager.roundInfo.updateTeamScore(SHARED.TEAMS.ATTACKERS, ATTACKERS)
      if (DEFENDERS) this.hudManager.roundInfo.updateTeamScore(SHARED.TEAMS.DEFENDERS, DEFENDERS)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when the round is paused
   * @param {boolean} toggle - flag that pause is on/off 
   */
  @event(SHARED.EVENTS.SERVER_ROUND_PAUSE)
  pause(toggle: boolean): void {
    try {
      this.playerManager.freeze(toggle)
      if (toggle) {
        this.hudManager.roundInfo.startPause()
      } else {
        this.hudManager.roundInfo.stopPause()
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  @command(["spec", "spectate"])
  spectate(cmdDesc: string, playerIdOrName?: string): void {
    try {
      if (!this.isRunning) {
        this.hudManager.notifyChat(SHARED.MSG.ERR_ROUND_IS_NOT_RUNNING) 
        return
      }
      if (this.playerManager.getState() === SHARED.STATE.ALIVE) {
        this.hudManager.notifyChat(SHARED.MSG.ERR_PLAYER_IN_ROUND)
        return
      }

      this.interactionManager.toggleSpectate(playerIdOrName)

      const isEnabled = this.interactionManager.getSpectate().isEnabled()
      if (isEnabled && !this.playerManager.hasState(SHARED.STATE.SPECTATE)) {
        this.playerManager.setState(SHARED.STATE.SPECTATE)
      } else if (isEnabled === false) {
        this.playerManager.setState(SHARED.STATE.IDLE)
        this.playerManager.spawnInLobby()
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Collect data for info panel
   * @param map 
   */
  private getRoundInfoData(map: TYPES.GameMap, playerIds: number[]): Partial<InfoPanel> {
    const att = this.dummyConfigManager.getTeam(SHARED.TEAMS.ATTACKERS)
    const def = this.dummyConfigManager.getTeam(SHARED.TEAMS.DEFENDERS)

    const players = playerIds.map(id => mp.players.atRemoteId(id))

    const attPlayers: number[] = players
      .filter(player => this.playerManager.getTeam(player) === SHARED.TEAMS.ATTACKERS)
      .map(player => player.getHealth())
    const defPlayers: number[] = players
      .filter(player => this.playerManager.getTeam(player) === SHARED.TEAMS.DEFENDERS)
      .map(player => player.getHealth())

    
    return {
      round: {
        arena: map.code,
      },
      team: {
        ATTACKERS: {
          name: att.NAME,
          color: att.COLOR,
          players: attPlayers,
          score: this.statManager.getScore(SHARED.TEAMS.ATTACKERS),
        },
        DEFENDERS: {
          name: def.NAME,
          color: def.COLOR,
          players: defPlayers,
          score: this.statManager.getScore(SHARED.TEAMS.DEFENDERS),
        }
      }
    }
  }
}

export { RoundManager }