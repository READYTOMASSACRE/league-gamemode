import { Hud } from "../Hud"

/**
 * An effect - Round start
 */
class RoundStart extends Hud {
  private timeoutId?        : NodeJS.Timeout
  private playingSeconds    : number = 0
  private mapCode           : string = ""
  private roundStartDate    : number = 0

  /**
   * @inheritdoc
   */
  start(code: string): RoundStart {
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
    this.startTick()

    return this
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
  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }

    this.stopTick()
    mp.events.remove(RageEnums.EventKey.RENDER, this.render)
  }

  /**
   * @inheritdoc
   */
  render(): void {
    try {
      const text = this.lang.get(SHARED.MSG.ROUND_START_EFFECT_TEXT, this.mapCode, this.playingSeconds.toString())
  
      mp.game.graphics.drawText(text, [0.5, 0.5], this.textParams)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
      this.stop()
    }
  }
}

export { RoundStart }