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
  ) {
    this.start    = this.start.bind(this)
    this.end      = this.end.bind(this)
    this.pause    = this.pause.bind(this)
  }

  /**
   * Event
   * 
   * Fires when the round has started
   * @param {number} mapId - the id of map
   */
  @event(SHARED.EVENTS.SERVER_ROUND_START)
  start(mapId: number, playerIds: number[], roundTimeIntervalMs: number): void {
    try {
      const map    = this.dummyMapManager.loadMap(mapId)
      const config = this.dummyConfigManager.dummy
      const zone   = new Zone(map)
  
      this.mapManager.drawZone(map)
      this.zoneManager.inspect(zone)
      this.dialogManager.open(SHARED.RPC_DIALOG.CLIENT_WEAPON_DIALOG_OPEN, config.data.WEAPON_SET)

      const data = this.getRoundInfoData(map, playerIds)

      this.hudManager.roundInfo.start(data, roundTimeIntervalMs)
      this.hudManager.votemapNotify.stop()
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
  end(): void {
    try {
      this.mapManager.clearZone()
      this.zoneManager.stopInspect()
      this.dialogManager.close(SHARED.RPC_DIALOG.CLIENT_WEAPON_DIALOG_CLOSE)
      this.hudManager.roundInfo.stop()
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
      this.playerManager.player.freezePosition(toggle)
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
      arena: map.code,
      team: {
        ATTACKERS: {
          name: att.NAME,
          color: att.COLOR,
          players: attPlayers
        },
        DEFENDERS: {
          name: def.NAME,
          color: def.COLOR,
          players: defPlayers,
        }
      }
    }
  }
}

export { RoundManager }