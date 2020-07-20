import { singleton } from 'tsyringe'
import { Zone } from '../entities/Zone'

export const MAX_ROLLBACK_ATTEMPTS = 10
export const DELAY_INSPECT = 100

/**
 * Class to manage the zones
 */
@singleton()
class ZoneManager {
  private zone?: Zone
  private attempts: number = 0
  private player: PlayerMp = mp.players.local
  private delay: number = Date.now()

  constructor() {
    this.inspectHandler = this.inspectHandler.bind(this)
    this.inspect = this.inspect.bind(this)
    this.stopInspect = this.stopInspect.bind(this)
  }

  /**
   * Inspect the zone
   * @param {Zone} zone 
   */
  inspect(zone: Zone): void {
    this.zone = zone
    mp.events.add(RageEnums.EventKey.RENDER, this.inspectHandler)
  }

  /**
   * Stop inspect the zone
   */
  stopInspect(): void {
    mp.events.remove(RageEnums.EventKey.RENDER, this.inspectHandler)
  }

  /**
   * Inspect lifecycle
   */
  inspectHandler(): void {
    this.outOfZone() && this.rollback() || this.commit()
  }

  /**
   * Check if the local player out of a zone
   */
  private outOfZone(): boolean {
    return !!(this.zone && this.zone.out(this.player.vector2))
  }

  /**
   * Change a position of the local player
   */
  private rollback(): void {
    const delay = Date.now()
    if (delay - this.delay >= DELAY_INSPECT && this.player.customData.rollbackPosition) {
      this.delay = delay
      this.player.position = this.player.customData.rollbackPosition
    }
  }

  /**
   * Commit a new rollback position
   */
  private commit(): void {
    if (this.zone && this.zone.in(this.player.vector2)) {
      this.player.customData.rollbackPosition = this.player.position
      this.player.customData.rollbackVector = this.player.vector2
    }
  }
}

export { ZoneManager }