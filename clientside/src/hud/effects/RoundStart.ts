import { Hud } from "../Hud"

interface HandleParam {
  current: number
  step: number
  max?: number
}
/**
 * An effect - Round start
 */
class RoundStart extends Hud {
  static readonly CAMERA_NAME: string = 'ROUND_START_CAMERA'

  private timeoutId?        : NodeJS.Timeout
  private playingSeconds    : number = 0
  private mapCode           : string = ""
  private roundStartDate    : number = 0
  private cam               : CameraMp = mp.cameras.new(RoundStart.CAMERA_NAME)
  private camVector         : Vector3Mp = new mp.Vector3(0, 0, 0)

  private radius: HandleParam = {
    current: 0,
    step: 0.1,
    max: 50
  }
  private angle: HandleParam = {
    current: 0,
    step: 0.5,
  }
  private zOffset: HandleParam = {
    current: 0,
    step: 0.05,
    max: 25
  }

  /**
   * @inheritdoc
   */
  start(code: string, vector: Vector3Mp): RoundStart {
    if (this.timeoutId) this.stop()

    // set up the begining options
    const { PLAYING_SECONDS }   = this.dummyConfig.getRoundStartEffect()
    this.playingSeconds         = PLAYING_SECONDS
    this.mapCode                = code
    this.roundStartDate         = Date.now()

    // add a render event
    mp.events.add(RageEnums.EventKey.RENDER, this.render)

    // set up an ending handler
    this.timeoutId = setTimeout(() => this.stop(), PLAYING_SECONDS * 1000)

    // set up default params
    this.setDefault()

    // set up tick function
    this.startTick()

    // setting camera
    this.setCamera(true, vector)

    return this
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }

    this.stopTick()
    this.setCamera(false)
    mp.events.remove(RageEnums.EventKey.RENDER, this.render)
  }

  /**
   * Set default params
   */
  setDefault(): void {
    this.radius.current = 0
    this.angle.current = 0
    this.zOffset.current = 0
  }

  /**
   * Setting camera's state
   * @param {boolean} toggle 
   */
  setCamera(toggle: boolean, vector?: Vector3Mp): void {
    if (toggle === true) {
      if (vector) this.camVector = vector

      const { x, y, z } = this.camVector
      this.cam.pointAtCoord(x, y, z)
      this.cam.setCoord(x, y, z)
    }

    this.cam.setActive(toggle)
    mp.game.cam.renderScriptCams(toggle, false, 0, true, false)
  }

  /**
   * @inheritdoc
   */
  tick(): void {
    const now           = Date.now()
    const timePassed    = Math.round((now - this.roundStartDate) / 1000)

    const { PLAYING_SECONDS } = this.dummyConfig.getRoundStartEffect()
    this.playingSeconds = PLAYING_SECONDS - timePassed
  }

  /**
   * @inheritdoc
   */
  render(): void {
    try {
      const text = this.lang.get(SHARED.MSG.ROUND_START_EFFECT_TEXT, this.mapCode, this.playingSeconds.toString())
  
      mp.game.graphics.drawText(text, [0.5, 0.5], this.textParams)
      this.moveCamera()
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
      this.stop()
    }
  }

  /**
   * Moving camera per render
   */
  moveCamera(): void {
    const { x, y, z } = this.camVector

    const rad = this.angle.current * Math.PI / 180
    const offsetX = this.radius.current * Math.cos(rad)
    const offsetY = this.radius.current * Math.sin(rad)

    this.angle.current += this.angle.step
    if (!this.radius.max || this.radius.max > this.radius.current) {
      this.radius.current += this.radius.step
    }

    if (!this.zOffset.max || this.zOffset.max > this.zOffset.current) {
      this.zOffset.current += this.zOffset.step
    }

    this.cam.setCoord(x + offsetX, y + offsetY, z + this.zOffset.current)
  }
}

export { RoundStart }