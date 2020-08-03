import { Hud } from "./Hud"

/**
 * Hud element - Gamemode
 */
class Gamemode extends Hud {
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
    const name = this.dummyConfig.getGamemode()
    const version = this.dummyConfig.getGamemodeVersion()

    mp.game.graphics.drawText(`${name} ${version}`, [0.2, 0.95], this.textParams)
  }
}

export { Gamemode }