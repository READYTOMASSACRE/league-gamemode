import { Hud } from "./Hud"
import { colorGradient, hex2rgba } from "../utils"

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
class Nametag extends Hud {
  static readonly MAX_DISTANCE = 2625
  static readonly VISIBLE_BIT_MAP = 1 | 16 | 256

  private cam?              : CameraMp
  private _healthParams?    : HealthParams
  private _colorGradient?   : [RGB, RGB]
  private player            = mp.players.local
  private maxDistance       = 0

  /**
   * @inheritdoc
   */
  prepare(): void {
    const { MAX_DISTANCE } = this.dummyConfig.getNameTagConfig()

    mp.nametags.enabled    = false
    this.maxDistance       = MAX_DISTANCE || Nametag.MAX_DISTANCE
    this.cam               = mp.cameras.new('gameplay')
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
          distance <= this.maxDistance
          && this.isVisible(player)
        ) {
          this.drawNickname(player, [x, y])
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
   * @param {PlayerMp} player
   * @param {Array2d} xy - position
   */
  private drawNickname(player: PlayerMp, xy: Array2d): void {
    const color = this.getTeamColor(player) || this.textParams.color
    const [scaleX, scaleY] = this.textParams.scale
    const [x, y] = xy

    mp.game.graphics.drawText("id: " + player.remoteId, [x, y-0.02], { ...this.textParams, color, scale: [scaleX - 0.2, scaleY - 0.2] })
    mp.game.graphics.drawText(player.name, xy, { ...this.textParams, color })
  }

  /**
   * Get a player's color
   * @param {PlayerMp} player 
   */
  private getTeamColor(player: PlayerMp): RGBA | void {
    if (player.sharedData) {
      const team = this.dummyConfig.getTeam(player.sharedData.teamId)
      if (team.COLOR) return hex2rgba(team.COLOR, 255)
    }
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
    mp.game.graphics.drawRect(x, y, width, height, 150, 150, 150, 50)
    mp.game.graphics.drawRect(x - healthOffsetx, y, healthWidth, height, r, g, b, 255)
  }

  /**
   * Check if the remote player is visible to a local player
   * 
   * @param {PlayerMp} player 
   */
  private isVisible(player: PlayerMp) : boolean {
    if (!this.cam) return false

    if (this.player.sharedData.state === SHARED.STATE.SPECTATE) return true

    const localPlayerGameCam = this.cam.getCoord()
    const playerHead = player.getBoneCoords(ENUMS.BONES.IK_Head, 0, 0, 0)

    return !mp.raycasting.testPointToPoint(localPlayerGameCam, playerHead, undefined, Nametag.VISIBLE_BIT_MAP)
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
    const [EMPTY, FULL] = this.colorGradient

    return colorGradient(health / 100, EMPTY, FULL)
  }

  private get healthParams(): HealthParams {
    if (!this._healthParams) {
      const { HEALTH_BAR: { WIDTH, HEIGHT, BORDER } } = this.dummyConfig.getNameTagConfig()

      this._healthParams = {
        width: WIDTH,
        height: HEIGHT,
        border: BORDER,
      }
    }

    return this._healthParams
  }
  get textParams(): TextParams {
    if (!this._textParams) {
      const { NICKNAME: { FONT, CENTRE, SCALE, OUTLINE } } = this.dummyConfig.getNameTagConfig()

      this._textParams = {
        font    : FONT,
        centre  : CENTRE,
        color   : [255, 255, 255, 255],
        scale   : SCALE,
        outline : OUTLINE,
      }
    }

    return this._textParams
  }

  private get colorGradient(): [RGB, RGB] {
    if (!this._colorGradient) {
      const { HEALTH_BAR: { GRADIENT } } = this.dummyConfig.getNameTagConfig()
      this._colorGradient = [GRADIENT.EMPTY, GRADIENT.FULL]
    }

    return this._colorGradient
  }
}

export { Nametag }