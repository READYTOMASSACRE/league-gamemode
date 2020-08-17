import { Hud } from "../Hud"
import { DummyConfigManager, DummyLanguageManager, DialogManager } from "../../managers"
import { ErrorHandler } from "../../core/ErrorHandler"

/**
 * An effect - Death
 */
class Death extends Hud {
  private timeoutId?: NodeJS.Timeout

  constructor(
    readonly dummyConfig    : DummyConfigManager,
    readonly lang           : DummyLanguageManager,
    readonly errHandler     : ErrorHandler,
    readonly dialogManager  : DialogManager,
  ) {
    super(dummyConfig, lang, errHandler)
  }

  /**
   * @inheritdoc
   */
  start(): Death {
    if (this.timeoutId) this.stop()

    const { PLAYING_SECONDS } = this.dummyConfig.getDeathEffect()

    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_NOTIFY_DEATH, this.lang.get(SHARED.MSG.DEATH_TEXT))
    this.timeoutId = setTimeout(() => this.stop(), PLAYING_SECONDS * 1000)

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

    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_NOTIFY_DEATH)
  }
}

export { Death }