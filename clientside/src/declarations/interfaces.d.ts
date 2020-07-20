declare namespace INTERFACES {
  /**
   * Implemenation to manage the gamemap functions
   */
  interface Manager {
    /**
     * Register all events from the server
     */
    load(): void
  }

  interface Route {
    /**
     * Clear all points and stop render a route
     */
    clear(): void
    /**
     * Start describe process to show a route
     * @param {number}  hudColor The HUD color of the GPS path
     * @param {boolean} displayOnFoot Draws the path regardless if the player is in a vehicle or not.
     * @param {boolean} followPlayer Draw the path partially between the previous and next point based on the players position between them. When false, the GPS appears to not disappear after the last leg is completed.
     */
    start(hudColor?: number, displayOnFoot?: boolean, followPlayer?: boolean): void
    /**
     * Add points to the GPS path
     * @param {CW.TYPES.Vector2} vector
     */
    addPoint(vector: SHARED.TYPES.Vector2): void
    /**
     * Set render on the map and minimap the GPS path
     * @param {boolean} toggle 
     * @param {number}  radarThickness 
     * @param {number}  mapThickness 
     */
    setRender(toggle: boolean, radarThickness?: number, mapThickness?: number): void
  }

  interface Render2DParamsFullScreen {
    color?: RGBA
  }

  interface Render2DParams {
    color?: RGBA
    position: { x: number, y: number }
    size?: { w: number, h: number }
    p9?: number
  }
  
  interface Render3DParams {
    position: Vector3Mp
    rotation: Vector3Mp
    scale: Vector3Mp
    color?: RGB
    p13?: number
  }

  interface Interaction {
    start(listener ?: Function): void
    stop(listener ?: Function): void
  }

  interface HudElement {
    /**
     * Start render the hud element
     * @param args - (optional) args to pass in the start method
     */
    start(...args: any[]): void
    /**
     * Stop render the hud element
     * @param args - (optional) args to pass in the stop method
     */
    stop(...args: any[]): void
  }

  interface TextParams {
    font: number
    centre: boolean
    color: RGBA
    scale: Array2d
    outline: boolean
  }
}