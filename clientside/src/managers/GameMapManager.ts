import { CustomRoute } from "../entities/Route"
import { singleton } from "tsyringe"
import { event, eventable } from "rage-decorators"

/**
 * Class to manage the gamemap functions
 */
@singleton()
@eventable()
class GameMapManager {
  private area: SHARED.TYPES.Vector2[] = []
  private route: INTERFACES.Route

  constructor() {
    this.route = new CustomRoute()

    this.drawZone = this.drawZone.bind(this)
    this.clearZone = this.clearZone.bind(this)
    this.onRender = this.onRender.bind(this)
  }

  /**
   * Draw a zone with vectors
   * @param {CW.Map} area An array of the map vectors
   */
  @event(SHARED.EVENTS.SERVER_MAP_DRAW)
  drawZone(map: TYPES.GameMap): void {
    this.area = map.area
    
    this.route.clear()
    this.route.start()

    mp.events.add(RageEnums.EventKey.RENDER, this.onRender)
  }

  /**
   * Stop drawing zone
   */
  @event(SHARED.EVENTS.SERVER_MAP_CLEAR)
  clearZone(): void {
    mp.events.remove(RageEnums.EventKey.RENDER, this.onRender)
    this.route.clear()
  }

  /**
   * Update route params
   */
  private onRender(): void {
    this.area.forEach((vector: SHARED.TYPES.Vector2) => this.route.addPoint(vector))
    this.route.setRender(true)
  }
}

export { GameMapManager }