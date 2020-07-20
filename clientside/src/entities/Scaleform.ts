/**
 * Class of scaleforms
 */
class Scaleform {
  private handle: number = 0
  private callable: { [key: string]: (value: any) => void } = {
    boolean: mp.game.graphics.pushScaleformMovieFunctionParameterBool,
    string: mp.game.graphics.pushScaleformMovieFunctionParameterString,
    number: mp.game.graphics.pushScaleformMovieFunctionParameterInt,
    float: mp.game.graphics.pushScaleformMovieFunctionParameterFloat,
  }

  constructor(private method: string, private queue: Map<string, (string|number|boolean)[]> = new Map()) {
    this.handle = mp.game.graphics.requestScaleformMovie(method)
  }

  get isValid() {
    return this.handle !== 0
  }

  get isLoaded() {
    return !!mp.game.graphics.hasScaleformMovieLoaded(this.handle)
  }

  /**
   * Call the scaleform function
   * @param {string} method - the name of a method
   * @param {(string|number|boolean)[]} args - the args which passed to a method
   */
  callFunction(method: string, ...args: (string|number|boolean)[]): boolean {
    let result: boolean = false
    if (this.isLoaded && this.isValid) {
      result = mp.game.graphics.pushScaleformMovieFunction(this.handle, method)
      args.forEach(value => {
        this.callable[this.getType(value)](value)
      })
      mp.game.graphics.popScaleformMovieFunctionVoid()
    } else {
      this.queue.set(method, args)
    }

    return result
  }

  /**
   * Get the type of a method
   * @param {string | number | boolean} value 
   */
  private getType(value: string | number | boolean): string {
    return typeof value === "number" && +value % 1 !== 0 && "float" || typeof value
  }

  /**
   * Tick on update
   */
  onUpdate(): void {
    if (this.isLoaded && this.isValid) {
      this.queue.forEach((args, method) => {
        this.callFunction(method, ...args)
        this.queue.delete(method)
      })
    }
  }

  /**
   * Render 2d scaleforms
   * @param {INTERFACES.Render2DParams} params 
   */
  render2D(params: INTERFACES.Render2DParams): void {
    this.onUpdate()

    if (this.isLoaded && this.isValid) {
      const {
        position,
        color: [r, g, b, a] = [255, 255, 255, 255],
        size = { w: 100, h: 100 },
        p9 = 2
      } = params

      mp.game.graphics.drawScaleformMovie(
        this.handle,
        position.x, position.y,
        size.w, size.h,
        r, g, b, a,
        p9
      )
    }
  }

  /**
   * Render 2d full screen
   * @param {INTERFACES.Render2DParamsFullScreen} params - (optional)
   */
  render2DFullScreen(params?: INTERFACES.Render2DParamsFullScreen): void {
    this.onUpdate()
    if (this.isLoaded && this.isValid) {
      const {
        color: [r, g, b, a] = [255, 255, 255, 255]
      } = params || {}

      mp.game.graphics.drawScaleformMovieFullscreen(
        this.handle,
        r, g, b, a,
        false
      )
    }
  }

  /**
   * Render 3d
   * @param {INTERFACES.Render3DParams} params 
   */
  render3D(params: INTERFACES.Render3DParams): void {
    this.onUpdate()
    if (this.isLoaded && this.isValid) {
      const {
        position,
        rotation,
        scale,
        color: [r, g, b] = [255, 255, 255],
        p13 = 2
      } = params

      mp.game.graphics.drawScaleformMovie3dNonAdditive(
        this.handle,
        position.x, position.y, position.z,
        rotation.x, rotation.y, rotation.z,
        r, g, b,
        scale.x, scale.y, scale.z,
        p13
      )
    }
  }

  /**
   * Render 3d additive
   * @param {INTERFACES.Render3DParams} params 
   */
  render3DAdditive(params: INTERFACES.Render3DParams) {
    this.onUpdate()
    if (this.isLoaded && this.isValid) {
      const {
        position,
        rotation,
        scale,
        color: [r, g, b] = [255, 255, 255],
        p13 = 2
      } = params

      mp.game.graphics.drawScaleformMovie3d(
        this.handle,
        position.x, position.y, position.z,
        rotation.x, rotation.y, rotation.z,
        r, g, b,
        scale.x, scale.y, scale.z,
        p13
      )
    }
  }
}

export { Scaleform }

