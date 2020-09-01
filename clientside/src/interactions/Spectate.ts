import { PlayerManager, HudManager } from "../managers"
import { keyBind, keyUnbind } from "../utils"
import { ErrorHandler } from "../core/ErrorHandler"

interface SpectateParams {
  playerManager   : PlayerManager
  hudManager      : HudManager
  errHandler      : ErrorHandler
}

interface Spectate extends SpectateParams {}

/**
 * Interaction of spectating players
 * @todo hide radar & health bar when player is in spectating
 */
class Spectate {
  static readonly CAMERA_NAME   : string = 'spectate'
  static readonly FOV           : number = 60

  private readonly SET_PLAYER_GAMECAM: string = '0x8BBACBF51DA047A8'

  private camera                : CameraMp
  private gameplayCam           : CameraMp
  private streamablePlayer      : PlayerMp
  private streamableVector      : Vector3Mp = mp.players.local.position
  private currentIndex          : number = 0
  private enabled               : boolean = false
  private prepared              : boolean = false

  constructor(params: SpectateParams) {
    this.playerManager    = params.playerManager
    this.hudManager       = params.hudManager
    this.errHandler       = params.errHandler
    this.streamablePlayer = mp.players.local
    this.camera           = mp.cameras.new(Spectate.CAMERA_NAME, this.streamablePlayer.position, this.streamablePlayer.getRotation(0), Spectate.FOV)
    this.gameplayCam      = mp.cameras.new('gameplay')
    this.turnLeft         = this.turnLeft.bind(this)
    this.turnRight        = this.turnRight.bind(this)
    this.render           = this.render.bind(this)
  }

  /**
   * Enable spectate mode
   */
  enable(): void {
    if (this.enabled) this.disable()

    this.bindKeys()

    this.hudManager.spectateCurrent.start()
    this.hudManager.spectateViewers.start()
    this.hudManager.controls.stop()

    mp.events.add(RageEnums.EventKey.RENDER, this.render)

    mp.game.cam.renderScriptCams(true, false, 0, true, false)

    mp.players.local.setInvincible(true)
    mp.players.local.setAlpha(0)
    mp.game.ui.displayRadar(false)
    mp.game.ui.displayHud(false)

    this.enabled = true
  }

  /**
   * Disable spectate mode
   */
  disable(): void {
    if (this.enabled) {
      mp.events.remove(RageEnums.EventKey.RENDER, this.render)

      this.setPlayersVisible()
      this.unbindKeys()

      this.playerManager.clearSpectate()

      this.hudManager.spectateCurrent.stop()
      this.hudManager.spectateViewers.stop()
      this.hudManager.controls.start()
      
      this.camera.setActive(false)
      this.gameplayCam.setActive(false)
      mp.game.cam.renderScriptCams(false, false, 0, true, false)
      mp.game.ui.displayRadar(true)
      mp.game.ui.displayHud(true)
    }

    this.enabled = false
  }

  /**
   * Event
   * 
   * Fires when an entity is in stream distance
   * 
   * @param {EntityMp} entity 
   */
  streamIn(entity: EntityMp) {
    const player = entity as PlayerMp

    if (player.type === 'player' && 'sharedData' in player) {
      this.toggleVisible(player)

      if (
        this.enabled
        && player.handle === this.streamablePlayer.handle
        && !this.prepared
      ) {
        this.prepare()
      }
    }
  }

  /**
   * Toggling visible players
   * 
   * @param {PlayerMp} player 
   */
  toggleVisible(player: PlayerMp): void {
    const isSpectating = this.playerManager.hasState(SHARED.STATE.SPECTATE, player)

    player.setInvincible(isSpectating)
    player.setAlpha(isSpectating ? 0 : 255)
  }

  /**
   * Setting players visible
   */
  setPlayersVisible(): void {
    mp.players.forEach(player => {
      player.setInvincible(false)
      player.setAlpha(255)
    })
  }

  getCamera(): CameraMp {
    return this.gameplayCam
  }

  /**
   * Change player's spectating
   * @param {PlayerMp} player 
   */
  turn(player: PlayerMp): void {
    if (!this.enabled) return

    if (
      mp.players.local.handle !== player.handle
      && this.playerManager.getState(player) === SHARED.STATE.ALIVE
    ) {
      this.streamablePlayer = player
      this.playerManager.setSpectate(player)
      this.hudManager.spectateCurrent.update(player)
      this.hudManager.spectateViewers.update(player)
      this.prepare()
    }
  }

  /**
   * Check if spectating is enbaled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Setting player's game cam
   */
  private setPlayerGameCam(): void {
    mp.game.invoke(this.SET_PLAYER_GAMECAM, this.streamablePlayer.handle)
  }

  /**
   * Bind keys
   */
  private bindKeys(): void {
    keyBind([ENUMS.KEYCODES.A], false, this.turnLeft)
    keyBind([ENUMS.KEYCODES.D], false, this.turnRight)
  }

  /**
   * Unbind keys
   */
  private unbindKeys(): void {
    keyUnbind([ENUMS.KEYCODES.A], false, this.turnLeft)
    keyUnbind([ENUMS.KEYCODES.D], false, this.turnRight)
  }

  /**
   * Check if a streamable player in stream
   */
  private isStreamablePlayerInStream(): boolean {
    return this.streamablePlayer.handle !== 0
  }

  /**
   * Check if a vector is empty
   * @param {Vector3Mp} vector 
   */
  private isNotEmptyVector(vector: Vector3Mp): boolean {
    const { x, y } = vector

    return x >= 1 || y >= 1 || x <= -1 || y <= -1
  }

  /**
   * Switch left a camera to another player
   */
  private turnLeft(): void {
    try {
      const players = this.getAlivePlayers()
  
      if (players.length) {
        if (typeof players[this.currentIndex - 1] !== 'undefined') {
          this.streamablePlayer = players[this.currentIndex - 1]
          this.currentIndex -= 1
        } else {
          this.streamablePlayer = players[players.length - 1]
          this.currentIndex = players.length - 1
        }

        this.turn(this.streamablePlayer)
      } else {
        return this.disable()
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Switch right a camera to another player
   */
  private turnRight(): void {
    try {
      const players = this.getAlivePlayers()
  
      if (players.length) {
        if (typeof players[this.currentIndex + 1] !== 'undefined') {
          this.streamablePlayer = players[this.currentIndex + 1]
          this.currentIndex += 1
        } else {
          this.streamablePlayer = players[0]
          this.currentIndex = 0
        }

        this.turn(this.streamablePlayer)
      } else {
        return this.disable()
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  private async prepare(): Promise<void> {
    this.prepared = false

    if (!this.isStreamablePlayerInStream()) {
      const [position, dimension] = await this.playerManager.getPlayerPosition(this.streamablePlayer)
  
      if (position === false || typeof dimension === 'undefined') {
        return this.disable()
      }
  
      this.gameplayCam.setActive(false)
      this.camera.setActive(true)
      this.camera.setCoord(position.x + 2, position.y + 2, position.z + 10)
      this.camera.pointAtCoord(position.x, position.y, position.z)

      await this.playerManager.setPlayerDataPromise({ position, dimension })
      this.streamablePlayer.forceStreamingUpdate()
      this.streamableVector = position
      this.gameplayCam.setActive(false)

      return
    }

    this.setPlayerGameCam()
    this.camera.stopPointing()
    this.camera.setActive(false)
    this.gameplayCam.setActive(true)

    this.prepared = true
  }

  /**
   * Update a camera's state
   */
  private render(): void {
    try {
      if (!this.prepared) {
        mp.players.local.setCoordsNoOffset(this.streamableVector.x, this.streamableVector.y, this.streamableVector.z - 5, false, false, false)
        return
      }

      if (!this.isStreamablePlayerInStream()) {
        this.streamablePlayer.forceStreamingUpdate()
        return
      }
      
      const streamVector = this.isNotEmptyVector(this.streamablePlayer.position)
        ? this.streamablePlayer.position
        : this.streamableVector

      mp.players.local.setCoordsNoOffset(streamVector.x, streamVector.y, streamVector.z - 5, false, false, false)

      this.setPlayerGameCam()
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err

      return this.disable()
    }
  }

  /**
   * Get alive players
   */
  private getAlivePlayers(): PlayerMp[] {
    return mp
      .players
      .toArray()
      .filter(player => this.playerManager.getState(player) === SHARED.STATE.ALIVE && mp.players.local.handle !== player.handle)
  }
}

export { Spectate }