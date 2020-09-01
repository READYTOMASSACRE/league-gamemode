/**
 * Fly mechanics
 */
class Fly
{
  static readonly FAST_SPEED = 8
  static readonly DEFAULT_SPEED = 0.1
  static readonly NORMAL_SPEED = 1.5

  static readonly CAMERA_NAME = "FLYING_CAM"

  private flying: boolean = false

  private float: number = 2
  private width: number = 2
  private height: number = 2

  private cam: CameraMp = mp.cameras.new(Fly.CAMERA_NAME)
  private gameplayCam: CameraMp = mp.cameras.new('gameplay')
  private speed: number = Fly.DEFAULT_SPEED

  constructor(private player: PlayerMp = mp.players.local) {
    this.render = this.render.bind(this)
  }

  /**
   * Toggle current state
   * @param {boolean} state 
   */
  toggle(state: boolean): void {
    if (state === true) {
      mp.events.add(RageEnums.EventKey.RENDER, this.render)
    } else {
      mp.events.remove(RageEnums.EventKey.RENDER, this.render)
    }
  }

  /**
   * Render method
   */
  private render(): void {
    if (mp.game.controls.isControlJustPressed(0, ENUMS.CONTROLS.F5)) this.toggleFlying()
    if (this.flying) this.move()
  }

  /**
   * Toggle flying state
   */
  private toggleFlying(): void {
    this.flying = !this.flying

    this.player.setInvincible(this.flying)
    this.player.freezePosition(this.flying)
    this.player.setAlpha(this.flying ? 0 : 255)
    
    if (!this.flying
      && !mp.game.controls.isControlPressed(0, ENUMS.CONTROLS.Space)
    ) {
      let position    = this.player.position;
      position.z      = mp.game.gameplay.getGroundZFor3dCoord(position.x, position.y, position.z, 0.0, false)

      this.player.setCoordsNoOffset(position.x, position.y, position.z, false, false, false)
    }
  }

  /**
   * Make a movement
   */
  private move(): boolean {
    let position    = this.player.position
    const direction = this.gameplayCam.getDirection()

    if (mp.game.controls.isControlPressed(0, ENUMS.CONTROLS.LShift)) {
      this.speed = Fly.FAST_SPEED
    } else if (mp.game.controls.isControlPressed(0, ENUMS.CONTROLS.LAlt)) {
      this.speed = Fly.NORMAL_SPEED
    } else {
      this.speed = Fly.DEFAULT_SPEED
    }

    if (mp.game.controls.isControlPressed(0, ENUMS.CONTROLS.W)) {
      position = this.moveStraight(position, direction, this.speed)
    } else if (mp.game.controls.isControlPressed(0, ENUMS.CONTROLS.S)) {
      position = this.moveBack(position, direction, this.speed)
    }

    if (mp.game.controls.isControlPressed(0, ENUMS.CONTROLS.A)) {
      position = this.moveLeft(position, direction, this.speed)
    } else if (mp.game.controls.isControlPressed(0, ENUMS.CONTROLS.D)) {
      position = this.moveRight(position, direction, this.speed)
    }

    if (mp.game.controls.isControlPressed(0, ENUMS.CONTROLS.Space)) {
      position = this.moveUp(position, direction, this.speed)
    } else if (mp.game.controls.isControlPressed(0, ENUMS.CONTROLS.LCtrl)) {
      position = this.moveDown(position, direction, this.speed)
    }

    this.player.setCoordsNoOffset(position.x, position.y, position.z, false, false, false)

    return true
  }

  /**
   * Straight movement
   * 
   * @param {Vector3Mp} position 
   * @param {Vector3Mp} direction 
   */
  private moveStraight(position: Vector3Mp, direction: Vector3Mp, speed: number): Vector3Mp {
    position.x += direction.x * speed
    position.y += direction.y * speed
    position.z += direction.z * speed

    return position
  }

  /**
   * Back movement
   * 
   * @param {Vector3Mp} position 
   * @param {Vector3Mp} direction 
   */
  private moveBack(position: Vector3Mp, direction: Vector3Mp, speed: number): Vector3Mp {
    position.x -= direction.x * speed
    position.y -= direction.y * speed
    position.z -= direction.z * speed

    return position
  }

  /**
   * Left movement
   * 
   * @param {Vector3Mp} position 
   * @param {Vector3Mp} direction 
   */
  private moveLeft(position: Vector3Mp, direction: Vector3Mp, speed: number): Vector3Mp {
    position.x += (-direction.y) * speed
    position.y += direction.x * speed

    return position
  }

  /**
   * Right movement
   * 
   * @param {Vector3Mp} position 
   * @param {Vector3Mp} direction 
   */
  private moveRight(position: Vector3Mp, direction: Vector3Mp, speed: number): Vector3Mp {
    position.x -= (-direction.y) * speed
    position.y -= direction.x * speed

    return position
  }

  /**
   * Up movement
   * 
   * @param {Vector3Mp} position 
   * @param {Vector3Mp} direction 
   */
  private moveUp(position: Vector3Mp, direction: Vector3Mp, speed: number): Vector3Mp {
    position.z += speed;

    return position
  }

  /**
   * Down movement
   * 
   * @param {Vector3Mp} position 
   * @param {Vector3Mp} direction 
   */
  private moveDown(position: Vector3Mp, direction: Vector3Mp, speed: number): Vector3Mp {
    position.z -= speed;

    return position
  }

  get isFlying() {
    return this.flying
  }
}

export { Fly }