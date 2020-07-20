/**
 * @todo remove this class later
 * Class only to test in the development mode
 */
class Fly
{
  static readonly CAMERA_NAME = "FLYING_CAM"

  private flying: boolean = false

  private float: number = 2
  private width: number = 2
  private height: number = 2

  private cam: CameraMp = mp.cameras.new(Fly.CAMERA_NAME)

  private controls: any = {
    F5: 327,
		W: 32,
		S: 33,
		A: 34,
		D: 35,
		Space: 321,
		LCtrl: 326
  }

  constructor(private player: PlayerMp = mp.players.local) {
    this.render = this.render.bind(this)
  }

  toggle(state: boolean = false): void {
    if (state) {
      mp.events.add(RageEnums.EventKey.RENDER, this.render)
    } else {
      mp.events.remove(RageEnums.EventKey.RENDER, this.render)
    }
  }

  private render(): void {
    if (mp.game.controls.isControlJustPressed(0, this.controls.F5)) this.toggleFlying()
    if (this.flying) this.move()
  }

  private toggleFlying(): void {
    this.flying = !this.flying
			
    this.player.setInvincible(this.flying)
    this.player.freezePosition(this.flying)
    this.player.setAlpha(this.flying ? 0 : 255)
    
    if (!this.flying
      && !mp.game.controls.isControlPressed(0, this.controls.Space)
    ) {
      let position = this.player.position;
      position.z = mp.game.gameplay.getGroundZFor3dCoord(position.x, position.y, position.z, 0.0, false)
      this.player.setCoordsNoOffset(position.x, position.y, position.z, false, false, false)
    }
  }

  private move(): boolean {
    let position = this.player.position
    const direction = this.cam.getDirection()

    let updated = true

    if (mp.game.controls.isControlPressed(0, this.controls.W)) {
      position = this.moveStraight(position, direction)
    } else if (mp.game.controls.isControlPressed(0, this.controls.S)) {
      position = this.moveBack(position, direction)
    } else {
      updated = false
      this.float = 2
    }

    if (mp.game.controls.isControlPressed(0, this.controls.A)) {
      position = this.moveLeft(position, direction)
    } else if (mp.game.controls.isControlPressed(0, this.controls.D)) {
      position = this.moveRight(position, direction)
    } else {
      updated = false
      this.width = 2
    }

    if (mp.game.controls.isControlPressed(0, this.controls.Space)) {
      position = this.moveUp(position, direction)
    } else if (mp.game.controls.isControlPressed(0, this.controls.LCtrl)) {
      position = this.moveDown(position, direction)
    } else {
      updated = false
      this.height = 2
    }

    // if (updated)
    this.player.setCoordsNoOffset(position.x, position.y, position.z, false, false, false)

    return true
  }

  private moveStraight(position: Vector3Mp, direction: Vector3Mp): Vector3Mp {
    if (this.float < 8.0) this.float *= 1.025
    position.x += direction.x * this.float
    position.y += direction.y * this.float
    position.z += direction.z * this.float

    return position
  }

  private moveBack(position: Vector3Mp, direction: Vector3Mp): Vector3Mp {
    if (this.float < 8.0) this.float *= 1.025
    position.x -= direction.x * this.float
    position.y -= direction.y * this.float
    position.z -= direction.z * this.float

    return position
  }

  private moveLeft(position: Vector3Mp, direction: Vector3Mp): Vector3Mp {
    if (this.width < 8.0) this.width *= 1.025

    position.x += (-direction.y) * this.width
    position.y += direction.x * this.width

    return position
  }

  private moveRight(position: Vector3Mp, direction: Vector3Mp): Vector3Mp {
    if (this.width < 8.0) this.width *= 1.025

    position.x -= (-direction.y) * this.width
    position.y -= direction.x * this.width

    return position
  }

  private moveUp(position: Vector3Mp, direction: Vector3Mp): Vector3Mp {
    if (this.height < 8.0) this.height *= 1.025
    position.z += this.height;

    return position
  }

  private moveDown(position: Vector3Mp, direction: Vector3Mp): Vector3Mp {
    if (this.height < 8.0) this.height *= 1.025
    position.z -= this.height;

    return position
  }

  get isFlying() {
    return this.flying
  }
}

export { Fly }