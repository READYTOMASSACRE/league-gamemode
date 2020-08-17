import { DummyConfigManager, DummyLanguageManager, DialogManager } from "../managers"
import { ErrorHandler } from "../core/ErrorHandler"
import { Tickable } from "../utils/Tickable"

/**
 * Base class of a hud element
 */
abstract class Hud extends Tickable implements INTERFACES.HudElement {
  protected _textParams?: INTERFACES.TextParams

  constructor(
    readonly dummyConfig: DummyConfigManager,
    readonly lang: DummyLanguageManager,
    readonly errHandler: ErrorHandler,
  ) {
    super(errHandler)

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