import { DummyConfigManager } from "../managers";
import { Language } from "../core/Language";
import { ErrorHandler } from "../core/ErrorHandler";

/**
 * Hud element - VotemapNotify
 */
class VotemapNotify implements INTERFACES.HudElement {
  static readonly SECOND = 1000

  private secondInterval    : number
  private stopped           : boolean = false
  private running           : boolean = false

  constructor (
    readonly dummyConfig: DummyConfigManager,
    readonly lang: Language,
    readonly errHandler: ErrorHandler,
  ) {
    this.secondInterval   = 0
    this.tick             = this.tick.bind(this)
  }

  /**
   * @inheritdoc
   */
  start(): void {
    this.stopped          = false
    this.secondInterval   = this.dummyConfig.getVoteIntervalSeconds()

    this.tick()
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    this.stopped = true
    this.running = false
  }

  /**
   * Render method
   */
  tick(): void {
    try {
      if (this.stopped || this.running) return

      this.running = true
  
      mp.gui.chat.push(this.lang.get(SHARED.MSG.VOTEMAP_NOTIFY, this.secondInterval + 's'))

      this.secondInterval--
  
      if (this.secondInterval < 0) {
        this.stop()
      } else {
        setTimeout(() => {
          this.running = false
          this.tick()
        }, VotemapNotify.SECOND)
      }
    } catch (err) {
      this.stop()
      if (!this.errHandler.handle(err)) throw err
    }
  }
}

export { VotemapNotify }