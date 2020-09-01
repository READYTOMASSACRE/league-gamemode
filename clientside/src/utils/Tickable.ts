import { ErrorHandler } from "../core/ErrorHandler"
import { EventEmitter } from "events"

abstract class Tickable extends EventEmitter {
  protected stopped: boolean = true

  constructor(readonly errHandler: ErrorHandler) {
    super()

    this.tick = this.tick.bind(this)
  }

  /**
   * An update function which will call from the HudManager if it necessary
   * Invoke all tickable functions will be written in HudManager
   */
  tick(...args: any[]): void {}

  /**
   * Start invoking the tick method
   */
  startTick(): void {
    this.stopped = false
  }
  /**
   * Stop invoking the tick method
   */
  stopTick(): void {
    this.stopped = true
  }

  get isStopped(): boolean {
    return this.stopped
  }
}

export { Tickable }