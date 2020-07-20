import { DummyConfigManager } from "../managers"
import { colorGradient } from "../utils"
import { ErrorHandler } from "../core/ErrorHandler"

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
 * Hud element - Nametag
 */
class Nametag implements INTERFACES.HudElement {
  static readonly MAX_DISTANCE = 2625
  static readonly VISIBLE_BIT_MAP = 1 | 16 | 256

  private _textParams?: TextParams
  private _healthParams?: HealthParams
  private player = mp.players.local

  constructor(
    readonly dummyConfig: DummyConfigManager,
    readonly errHandler: ErrorHandler,
  ) {
    mp.nametags.enabled   = false
    this.render           = this.render.bind(this)
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
   * Render method
   * @param {any[]} nametags - nametags of players
   */
  render(nametags: any[]): void {
    try {
      nametags.forEach(nametag => {
        const [ player, x, y, distance ]: [ PlayerMp, number, number, number ] = nametag
  
        if (
          distance <= Nametag.MAX_DISTANCE
          &&  this.isVisible(player)
        ) {
          this.drawNickname(player.name, [x, y])
          this.drawHealth(x, y, player.getHealth())
        }
      })
    } catch (err) {
      this.stop()
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Draw nicknames on the screen
   * @param {string} name - player name
   * @param {Array2d} xy - position
   */
  private drawNickname(name: string, xy: Array2d): void {
    mp.game.graphics.drawText(name, xy, this.textParams)
  }

  /**
   * Draw the health bar
   * @param {number} x - x position
   * @param {number} y - y position
   * @param {number} xy - player heatlh
   */
  private drawHealth(x: number, y: number, health: number): void {
    y += 0.042

    const { width, height, border }   = this.healthParams
    const healthWidth                 = this.calculateHealthWidth(health, width)
    const healthOffsetx               = this.calculateHealthOffsetX(health, width)
    const [r, g, b]                   = this.getColorHealth(health)

    mp.game.graphics.drawRect(x, y, width + border * 2, height + border * 2, 0, 0, 0, 200)
    mp.game.graphics.drawRect(x, y, width, height, 150, 150, 150, 200)
    mp.game.graphics.drawRect(x - healthOffsetx, y, healthWidth, height, r, g, b, 255)
  }

  /**
   * Check if the remote player is visible to a local player
   * 
   * @param {PlayerMp} player 
   */
  private isVisible(player: PlayerMp) : boolean {
    const localPlayerHead   = this.player.getBoneCoords(ENUMS.BONES.IK_Head, 0, 0, 0)
    const playerHead        = player.getBoneCoords(ENUMS.BONES.IK_Head, 0, 0, 0)

    return !mp.raycasting.testPointToPoint(localPlayerHead, playerHead, undefined, Nametag.VISIBLE_BIT_MAP)
  }

  /**
   * Calculate the health offest
   * @param {number} health 
   * @param {number} width 
   */
  private calculateHealthOffsetX(health: number, width: number): number {
    return width / 2 * (1 - health / 100)
  }

  /**
   * Calculate the health width
   * @param {number} health 
   * @param {number} width 
   */
  private calculateHealthWidth(health: number, width: number): number {
    if (health === 0) return 0

    return (width * health) / 100
  }

  /**
   * Get color heatlh
   * @param {number} health 
   */
  private getColorHealth(health: number): RGBA {
    const greenColor    : RGB = [69, 243, 25]
    const redColor      : RGB = [226, 14, 15]

    return colorGradient(health / 100, redColor, greenColor)
  }

  private get healthParams(): HealthParams {
    /** @todo get from config */
    if (!this._healthParams) {
      this._healthParams = {
        width: 0.06,
        height: 0.0105,
        border: 0.0015,
      }
    }

    return this._healthParams
  }
  private get textParams(): TextParams {
    if (!this._textParams) {
      /** @todo get from config */
      this._textParams = {
        font    : 4,
        centre  : false,
        color   : [255, 255, 255, 255],
        scale   : [0.6, 0.6],
        outline : true,
      }
    }

    return this._textParams
  }
}

export { Nametag }