import { Hud } from "./Hud"

/**
 * Hud element - Controls
 */
class Controls extends Hud {
  private _controls: any = {}
  /**
   * @inheritdoc
   */
  prepare(): void {
    this._controls['controls']      = this.lang.get(SHARED.MSG.CONTROL)
    this._controls['scoreboard']    = this.lang.get(SHARED.MSG.CONTROL_SCOREBOARD)
    this._controls['gamemenu']      = this.lang.get(SHARED.MSG.CONTROL_GAMEMENU)
    this._controls['teamchange']    = this.lang.get(SHARED.MSG.CONTROL_TEAMCHANGE)
  }
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
   * @inheritdoc
   */
  render(): void {
    const x = 0.2
    const y = 0.85

    mp.game.graphics.drawText(this.control, [x-0.017, y-0.023], this.textParams)
    mp.game.graphics.drawText(this.tilde, [x-0.03, y], this.textParams)
    mp.game.graphics.drawText(this.scoreboard, [x, y], this.textParams)
    mp.game.graphics.drawText(this.f2, [x-0.03, y+0.02], this.textParams)
    mp.game.graphics.drawText(this.gamemenu, [x, y+0.02], this.textParams)
    mp.game.graphics.drawText(this.f4, [x-0.03, y+0.04], this.textParams)
    mp.game.graphics.drawText(this.teamchange, [x, y+0.04], this.textParams)
  }

  /**
   * Get tilde button
   */
  get tilde(): string {
    return '`'
  }

  /**
   * Get f4 button
   */
  get f4(): string {
    return 'F4'
  }

  /**
   * Get f2 button
   */
  get f2(): string {
    return 'F2'
  }

  /**
   * Get control title
   */
  get control(): string {
    return this._controls['controls'] || ""
  }

  /**
   * Get scoreboard title
   */
  get scoreboard(): string {
    return this._controls['scoreboard'] || ""
  }

  /**
   * Get gamemenu title
   */
  get gamemenu(): string {
    return this._controls['gamemenu'] || ""
  }

  /**
   * Get teamchange title
   */
  get teamchange(): string {
    return this._controls['teamchange'] || ""
  }

  /**
   * Get default text params for the function mp.game.graphics.drawText
   */
  get textParams(): INTERFACES.TextParams {
    if (!this._textParams) {
      const { TEXT: { FONT, SCALE } } = this.dummyConfig.getGlobalHudConfig()

      this._textParams = {
        font: FONT,
        centre: false,
        color: [255, 255, 255, 200],
        scale: [SCALE[0] - 0.15, SCALE[1] - 0.15],
        outline: false,
      }
    }

    return this._textParams
  }
}

export { Controls }