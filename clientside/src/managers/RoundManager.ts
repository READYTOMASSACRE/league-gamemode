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

/**
 * Class to manage the round
 */
@singleton()
@autoInjectable()
@eventable()
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
  ) {
    this.start = this.start.bind(this)
    this.end = this.end.bind(this)
  }

  /**
   * Event
   * 
   * Fires when the round has started
   * @param {number} mapId - the id of map
   */
  @event(SHARED.EVENTS.SERVER_ROUND_START)
  start(mapId: number): void {
    try {
      const map    = this.dummyMapManager.loadMap(mapId)
      const config = this.dummyConfigManager.dummy
      const zone   = new Zone(map)
  
      this.mapManager.drawZone(map)
      this.zoneManager.inspect(zone)
      this.dialogManager.open(SHARED.RPC_DIALOG.CLIENT_WEAPON_DIALOG_OPEN, config.data.WEAPON_SET)
      this.hudManager.roundInfo.start()
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
    this.mapManager.clearZone()
    this.zoneManager.stopInspect()
    this.dialogManager.close(SHARED.RPC_DIALOG.CLIENT_WEAPON_DIALOG_CLOSE)
    this.hudManager.roundInfo.stop()
  }
}

export { RoundManager }