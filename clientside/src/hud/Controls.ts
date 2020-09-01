import { Hud } from "./Hud"
import { DummyConfigManager, DummyLanguageManager, DialogManager } from "../managers"
import { ErrorHandler } from "../core/ErrorHandler"
import { print } from "../utils"

/**
 * Hud element - Controls
 */
class Controls extends Hud {
  private _controls: any = {}

  constructor(
    readonly dummyConfig          : DummyConfigManager,
    readonly lang                 : DummyLanguageManager,
    readonly errHandler           : ErrorHandler,
    readonly dialogManager        : DialogManager,
  ) {
    super(dummyConfig, lang, errHandler)
  }

  /**
   * @inheritdoc
   */
  start(): void {
    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_CONTROLS_TOGGLE, true)
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_CONTROLS_TOGGLE, false)
  }
}

export { Controls }