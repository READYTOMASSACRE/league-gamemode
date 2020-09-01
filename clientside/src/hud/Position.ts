import { Hud } from "./Hud"

interface TextParams {
  font: number
  centre: boolean
  color: RGBA
  scale: Array2d
  outline: boolean
}

interface HealthParams {
  width: number
  height: number
  border: number
}

/**
 * Hud element - Position
 */
class Position extends Hud {
  /**
   * @inheritdoc
   */
  start(): void {
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
      const { x, y, z } = mp.players.local.position
      mp.game.graphics.drawText(JSON.stringify({ x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) }), [0.2, 0.5], this.textParams)
    } catch (err) {
      this.stop()
      if (!this.errHandler.handle(err)) throw err
    }
  }

  get textParams(): TextParams {
    if (!this._textParams) {
      const { NICKNAME: { FONT, CENTRE, OUTLINE } } = this.dummyConfig.getNameTagConfig()

      this._textParams = {
        font    : FONT,
        centre  : CENTRE,
        color   : [255, 255, 255, 255],
        scale   : [0.35, 0.35],
        outline : OUTLINE,
      }
    }

    return this._textParams
  }
}

export { Position }