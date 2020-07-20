import { DummyConfigManager } from "../managers"
import { ErrorHandler } from "../core/ErrorHandler"
import { Language } from "../core/Language"

/**
 * Hud element - RoundInfo
 */
class RoundInfo implements INTERFACES.HudElement {
  static readonly SECOND = 1000

  private remaining: number
  private delay: number
  private _textParams?: INTERFACES.TextParams

  constructor(
    readonly dummyConfig: DummyConfigManager,
    readonly lang: Language,
    readonly errHandler: ErrorHandler,
  ) {
    this.remaining    = 0
    this.delay        = 0
    this.render       = this.render.bind(this)
  }

  /**
   * @inheritdoc
   */
  start(): void {
    this.remaining = this.getRoundSeconds()
    mp.events.add(RageEnums.EventKey.RENDER, this.render)
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    mp.events.remove(RageEnums.EventKey.RENDER, this.render)
  }

  /**
   * Render method
   */
  render(): void {
    try {
      const text = this.lang.get(SHARED.MSG.TIME_REMAINING, this.formatTimeRemaining())

      mp.game.graphics.drawText(text, [0.5, 0.005], this.textParams)
    } catch (err) {
      this.stop()
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Format time to render on the screen
   */
  private formatTimeRemaining(): string {
    const minutes = Math.floor(this.timeRemaining / 60)
    const seconds = this.timeRemaining - (minutes * 60)

    return `${minutes}:${seconds.toString().padStart(2,'0')}`
  }

  /**
   * Get round seconds from the server
   */
  private getRoundSeconds(): number {
    return this.dummyConfig.getRoundIntervalMinutes() * 60
  }

  get textParams(): INTERFACES.TextParams {
    if (!this._textParams) {
      /** @todo get from config */
      this._textParams = {
        font: 4,
        centre: true,
        color: [255, 255, 255, 255],
        scale: [0.4, 0.4],
        outline: true,
      }
    }

    return this._textParams
  }

  get timeRemaining(): number {
    const delay = Date.now()
    if (delay - this.delay >= RoundInfo.SECOND) {
      this.delay = delay
      this.remaining -= 1
    }

    return this.remaining
  }
}

export { RoundInfo }