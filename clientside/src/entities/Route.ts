export const HUD_COLOR: number         = 6
export const DISPLAY_ON_FOOT: boolean  = true
export const FOLLOW_PLAYER: boolean    = false
export const RADAR_THICKNESS: number   = 8
export const MAP_THICKNESS: number     = 8

/**
 * Makes the GPS path by params
 */
export abstract class Route implements INTERFACES.Route {
  readonly CLEAR_HASH: string      = ""
  readonly START_HASH: string      = ""
  readonly ADD_POINT_HASH: string  = ""
  readonly SET_RENDER_HASH: string = ""

  /**
   * @inheritdoc
   */
  clear(): void {
    mp.game.invoke(this.CLEAR_HASH)
  }
  /**
   * @inheritdoc
   */
  start(hudColor?: number, displayOnFoot?: boolean, followPlayer?: boolean): void {
    mp.game.invoke(this.START_HASH, hudColor || HUD_COLOR, displayOnFoot || DISPLAY_ON_FOOT, followPlayer || FOLLOW_PLAYER)
  }
  /**
   * @inheritdoc
   */
  addPoint(vector: SHARED.TYPES.Vector2): void {
    mp.game.invoke(this.ADD_POINT_HASH, vector.x, vector.y, 0)
  }
  /**
   * @inheritdoc
   */
  setRender(toggle: boolean, radarThickness?: number, mapThickness?: number): void {
    mp.game.invoke(this.SET_RENDER_HASH, toggle, radarThickness || RADAR_THICKNESS, mapThickness || MAP_THICKNESS)
  }
}

/**
 * @inheritdoc
 */
export class CustomRoute extends Route implements INTERFACES.Route {
  readonly CLEAR_HASH: string      = "0xE6DE0561D9232A64"
  readonly START_HASH: string      = "0xDB34E8D56FC13B08"
  readonly ADD_POINT_HASH: string  = "0x311438A071DD9B1A"
  readonly SET_RENDER_HASH: string = "0x900086F371220B6F"
}

/**
 * @inheritdoc
 */
export class MultiRoute extends Route implements INTERFACES.Route {
  readonly CLEAR_HASH: string      = "0x67EEDEA1B9BAFD94"
  readonly START_HASH: string      = "0x3D3D15AF7BCAAF83"
  readonly ADD_POINT_HASH: string  = "0xA905192A6781C41B"
  readonly SET_RENDER_HASH: string = "0x3DDA37128DD1ACA8"
}