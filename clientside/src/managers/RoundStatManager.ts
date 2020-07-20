import { eventable, event } from "rage-decorators"
import { singleton, autoInjectable } from "tsyringe"
import { PlayerManager } from "./PlayerManager"

/**
 * Class to manage the round stats
 */
@singleton()
@eventable()
@autoInjectable()
class RoundStatManager {
  private player = mp.players.local

  constructor(
    private readonly playerManager: PlayerManager
  ) {
    this.outcomingDamage    = this.outcomingDamage.bind(this)
    this.incomingDamage     = this.incomingDamage.bind(this)
    this.playerDeath        = this.playerDeath.bind(this)
    this.playerWeaponShot   = this.playerWeaponShot.bind(this)
  }

  /**
   * Event
   * 
   * Fires when the local player has given a damage
   * Update the round stats
   * @param sourceEntity 
   * @param targetEntity 
   * @param targetPlayer 
   * @param weapon 
   * @param boneIndex 
   * @param damage 
   */
  @event(RageEnums.EventKey.OUTGOING_DAMAGE)
  outcomingDamage(sourceEntity: PlayerMp, targetEntity: PlayerMp, targetPlayer: PlayerMp, weapon: number, boneIndex: number, damage: number): boolean | void {
    if (
      this.playerManager.hasState(SHARED.STATE.ALIVE)
      && targetPlayer
      && this.playerManager.hasState(SHARED.STATE.ALIVE, targetPlayer)
    ) {
      if (this.sameTeam(targetPlayer)) return true

      this.addDamage(weapon, damage)
      this.addShotsHit()
    }
  }

  /**
   * Event
   * 
   * Fires when the local player has received a damage
   * Update the round stats
   * @param sourceEntity 
   * @param targetEntity 
   * @param targetPlayer 
   * @param weapon 
   * @param boneIndex 
   * @param damage 
   */
  @event(RageEnums.EventKey.INCOMING_DAMAGE)
  incomingDamage(sourceEntity: PlayerMp, targetEntity: PlayerMp, targetPlayer: PlayerMp, weapon: number, boneIndex: number, damage: number): boolean | void {
    if (
      this.playerManager.hasState(SHARED.STATE.ALIVE)
      && sourceEntity.type === "player"
      && this.playerManager.hasState(SHARED.STATE.ALIVE, sourceEntity)
    ) {
      if (this.sameTeam(sourceEntity)) return true
      
      this.addAssist(sourceEntity)
      this.addDamageReceived(weapon, damage)
    }
  }

  /**
   * Event
   * 
   * Fires when the local player is dead
   * Update the round stats
   * @param player 
   * @param reason 
   * @param killer 
   */
  @event(RageEnums.EventKey.PLAYER_DEATH)
  playerDeath(player: PlayerMp, reason: number, killer: PlayerMp): void {
    if (
      this.playerManager.hasState([SHARED.STATE.ALIVE, SHARED.STATE.DEAD])
      && this.playerManager.hasState([SHARED.STATE.ALIVE], killer)
      && this.player.customData.assist
    ) {
      if (this.player.customData.assist[killer.remoteId]) delete this.player.customData.assist[killer.remoteId]

      mp.events.callRemote(SHARED.EVENTS.CLIENT_ASSIST_UPDATE, JSON.stringify(this.player.customData.assist))
    }
  }

  /**
   * Event
   * 
   * Fires when the local player has shot
   * Update the round stats
   * @param targetPosition 
   * @param targetEntity 
   */
  @event(RageEnums.EventKey.PLAYER_WEAPON_SHOT)
  playerWeaponShot<E extends EntityMp>(targetPosition: Vector3Mp, targetEntity: E): void {
    if (this.playerManager.hasState([SHARED.STATE.ALIVE])) {
      this.addShotsFired()
    }
  }

  /**
   * Add an assit to the player
   * @param {PlayerMp} target - assist player
   * @param {number} expires - a date when the assist is expired
   */
  addAssist(target: PlayerMp, expires: number = Date.now()): void {
    this.player.customData.assist[target.remoteId] = expires
  }

  /**
   * Add a damage to the local player
   * @param {number} weapon 
   * @param {number} damage 
   */
  addDamage(weapon: number, damage: number): void {
    mp.events.callRemote(SHARED.EVENTS.CLIENT_ROUND_STAT_UPDATE, "damage", JSON.stringify({ [weapon]: damage }))
  }

  /**
   * Add a received damage to the local player
   * @param {number} weapon 
   * @param {number} damage 
   */
  addDamageReceived(weapon: number, damage: number): void {
    mp.events.callRemote(SHARED.EVENTS.CLIENT_ROUND_STAT_UPDATE, "damageReceived", JSON.stringify({ [weapon]: damage }))
  }

  /**
   * Add a hit to the local player
   */
  addShotsHit(): void {
    mp.events.callRemote(SHARED.EVENTS.CLIENT_ROUND_STAT_UPDATE, "shotsHit", 1)
  }

  /**
   * Add a shot to the local player
   */
  addShotsFired(): void {
    mp.events.callRemote(SHARED.EVENTS.CLIENT_ROUND_STAT_UPDATE, "shotsFired", 1)
  }

  /**
   * Check if the local player in the same team with the player
   * @param {PlayerMp} target 
   */
  sameTeam(target: PlayerMp): boolean {
    return this.playerManager.getTeam(target) === this.playerManager.getTeam()
  }
}

export { RoundStatManager }