import { Zone } from '../entities/Zone'
import { GameMapManager } from './GameMapManager'
import { ZoneManager } from './ZoneManager'
import { DialogManager } from './DialogManager'
import { singleton, autoInjectable } from 'tsyringe'
import { DummyMapManager } from './dummies/DummyMapManager'
import { DummyConfigManager } from './dummies/DummyConfigManager'
import { event, eventable } from 'rage-decorators'
import { ErrorHandler } from '../core/ErrorHandler'
import { HudManager } from './HudManager'
import { InfoPanel } from '../hud/RoundInfo'
import { PlayerManager } from './PlayerManager'
import { DummyLanguageManager } from './dummies/DummyLanguageManager'
import { DummyRoundStatManager } from './dummies/DummyRoundStatManager'
import { NotFoundNotifyError } from '../errors/PlayerErrors'
import { print } from '../utils'

/**
 * Class to manage the round
 */
@singleton()
@eventable()
@autoInjectable()
class RoundManager {
  public map?: TYPES.GameMap
  public zone?: Zone

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
  ) {
    this.prepare      = this.prepare.bind(this)
    this.start        = this.start.bind(this)
    this.end          = this.end.bind(this)
    this.pause        = this.pause.bind(this)
    this.teamscore    = this.teamscore.bind(this)
    this.remove       = this.remove.bind(this)
  }

  /**
   * Event
   * 
   * Fires when the round has prepared
   * @param {number} mapId - the id of map
   */
  @event(SHARED.EVENTS.SERVER_ROUND_PREPARE)
  prepare(mapId?: number, hasAdded?: boolean): void {
    try {
      if (typeof mapId === 'undefined') {
        throw new NotFoundNotifyError(SHARED.MSG.ERR_NOT_FOUND)
      }

      const map       = this.dummyMapManager.loadMap(mapId)
      const zone      = new Zone(map)
      const config    = this.dummyConfigManager.dummy

      this.mapManager.drawZone(map)
      this.zoneManager.inspect(zone)
      if (!hasAdded) this.playerManager.freeze(true)

      this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_WEAPON_DIALOG_OPEN, config.data.WEAPON_SET)

      this.enableRoundHud(map, hasAdded)
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
  @event(SHARED.EVENTS.SERVER_ROUND_START)
  start(mapId: number, playerIds: number[], timePassedMs: number): void {
    try {
      const map   = this.dummyMapManager.loadMap(mapId)
      const data  = this.getRoundInfoData(map, playerIds)

      this.hudManager.roundInfo.roundStart(data, timePassedMs)
      this.playerManager.freeze(false)
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
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires a player has been removed from the round
   */
  @event(SHARED.EVENTS.SERVER_ROUND_PLAYER_REMOVE)
  remove(): void {
    try {
      this.mapManager.clearZone()
      this.zoneManager.stopInspect()
      this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_WEAPON_DIALOG_CLOSE)

      this.disableRoundHud()

      this.playerManager.freeze(false)
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
  enableRoundHud(map: TYPES.GameMap, hasAdded: boolean = false): void {
    this.hudManager.votemapNotify.stop()
    this.hudManager.roundStopEffect.stop()
    this.hudManager.damage.start()

    if (hasAdded === false) this.hudManager.roundStartEffect.start(map.code)
  }

  /**
   * Disable round hud
   * @param {SHARED.TEAMS} winner (optional) 
   */
  disableRoundHud(): void {
    this.hudManager.roundInfo.roundStop()
    this.hudManager.damage.stop()
    this.hudManager.roundStartEffect.stop()
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