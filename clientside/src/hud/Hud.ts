import { DummyConfigManager, DummyLanguageManager } from "../managers"
import { ErrorHandler } from "../core/ErrorHandler"

/**
 * Base class of a hud element
 */
abstract class Hud implements INTERFACES.HudElement {
  protected _textParams?: INTERFACES.TextParams

  protected readonly INTERVAL: number = 1000

  protected stopped: boolean = false
  protected interval?: NodeJS.Timeout
  
  constructor(
    readonly dummyConfig: DummyConfigManager,
    readonly lang: DummyLanguageManager,
    readonly errHandler: ErrorHandler,
  ) {
    this.render = this.render.bind(this)

    mp.events.add(SHARED.EVENTS.CLIENT_DUMMIES_READY, () => this.prepare())
  }

  /**
   * Event
   * 
   * Fires when all dummies has registered and hud element has created
   */
  protected prepare() {}

  /**
   * @inheritdoc
   */
  abstract start(...args: any[]): void

  /**
   * @inheritdoc
   */
  abstract stop(...args: any[]): void

  /**
   * Render a hud element
   */
  render(...args: any[]): void {}

  /**
   * Simulate the event Render by time this.SECOND
   */
  tick(callable: Function): void {
    try {
      this.stopped = false
      if (this.interval) {
        throw new ReferenceError("Interval has already set up")
      }
  
      callable()

      this.interval = setInterval(() => {
        if (this.stopped) return this.stopTick()
        if (typeof callable === 'function') callable()
      }, this.INTERVAL)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Stop invoking the tick method
   */
  stopTick(): void {
    this.stopped = true

    if (typeof this.interval !== 'undefined') {
      clearInterval(this.interval)
      this.interval = undefined
    }
  }

  /**
   * Get default text params for the function mp.game.graphics.drawText
   */
  get textParams(): INTERFACES.TextParams {
    if (!this._textParams) {
      const { TEXT: { FONT, CENTRE, COLOR, SCALE, OUTLINE } } = this.dummyConfig.getGlobalHudConfig()

      this._textParams = {
        font: FONT,
        centre: CENTRE,
        color: COLOR || [255, 255, 255, 255],
        scale: SCALE,
        outline: OUTLINE,
      }
    }

    return this._textParams
  }
}

export { Hud }