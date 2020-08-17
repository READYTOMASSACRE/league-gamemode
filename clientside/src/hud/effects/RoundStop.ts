import { Hud } from "../Hud"
import { DummyConfigManager, DummyLanguageManager, DialogManager } from "../../managers"
import { ErrorHandler } from "../../core/ErrorHandler"

/**
 * An effect - Round stop
 */
class RoundStop extends Hud {
  private timeoutId?: NodeJS.Timeout
  private params?: { text: string, color: string }

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
  start(winner?: SHARED.TEAMS): RoundStop {
    if (this.timeoutId) this.stop()

    const { PLAYING_END_SECONDS } = this.dummyConfig.getRoundStartEffect()

    if (winner) {
      const { NAME, COLOR } = this.dummyConfig.getTeam(winner)
      this.params = {
        text: this.lang.get(SHARED.MSG.ROUND_WINNING_TEXT, NAME),
        color: COLOR,
      }
    } else {
      this.params = {
        text: this.lang.get(SHARED.MSG.ROUND_STOP_MESSAGE),
        color: '#fff',
      }
    }
    
    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_NOTIFY_ROUND_END, 'in', this.params)
    this.timeoutId = setTimeout(() => this.stop(), PLAYING_END_SECONDS * 1000)

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

    if (this.params) {
      this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_NOTIFY_ROUND_END, 'out', this.params)
      this.params = undefined
    }
  }
}

export { RoundStop }