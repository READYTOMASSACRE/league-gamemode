import { eventable, event } from "rage-decorators"
import { singleton, autoInjectable } from "tsyringe"
import { PlayerManager } from "./PlayerManager"
import { ErrorHandler } from "../core/ErrorHandler"
import { HudManager } from "./HudManager"
import { WeaponManager } from "./WeaponManager"
import { throttle } from "../utils"

/**
 * Class to manage the round stats
 */
@singleton()
@eventable()
@autoInjectable()
class RoundStatManager {
  private player = mp.players.local
  private throttledIncomingUpdate?: Function
  private throttledOutcomingUpdate?: Function

  private summaryDamage       : number = 0
  private summaryDamageOut    : number = 0
  private summaryHits         : number = 0

  constructor(
    readonly playerManager    : PlayerManager,
    readonly errHandler       : ErrorHandler,
    readonly hudManager       : HudManager,
    readonly weaponManager    : WeaponManager,
  ) {
    this.outcomingDamage        = this.outcomingDamage.bind(this)
    this.incomingDamage         = this.incomingDamage.bind(this)
    this.playerDeath            = this.playerDeath.bind(this)
    this.playerWeaponShot       = this.playerWeaponShot.bind(this)
    this.updateOutcomingDamage  = this.updateOutcomingDamage.bind(this)
    this.updateIncomingDamage   = this.updateIncomingDamage.bind(this)
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
    try {
      if (
        this.playerManager.hasState(SHARED.STATE.ALIVE)
        && targetPlayer
        && this.playerManager.hasState(SHARED.STATE.ALIVE, targetPlayer)
      ) {
        if (this.sameTeam(targetPlayer)) return true

        const newDamage = weapon && this.weaponManager.calculateDamage(weapon) || damage
  
        this.summaryDamageOut += newDamage
        this.summaryHits += 1

        if (typeof this.throttledOutcomingUpdate === 'undefined') {
          this.throttledOutcomingUpdate = throttle(this.updateOutcomingDamage, 200)
        }

        this.throttledOutcomingUpdate(weapon)
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Throttle update outcoming damage
   * @param {number} weapon 
   */
  updateOutcomingDamage(weapon: number): void {
    try {
      if (typeof weapon !== 'undefined') {
        this.addDamage(weapon, this.summaryDamageOut)
      }

      this.addShotsHit(this.summaryHits)
      
      this.summaryDamageOut   = 0
      this.summaryHits        = 0
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
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
    try {
      if (this.playerManager.hasState(SHARED.STATE.SPECTATE)) {
        return true
      }

      if (
        this.playerManager.hasState(SHARED.STATE.ALIVE)
        && sourceEntity.type === "player"
        && this.playerManager.hasState(SHARED.STATE.ALIVE, sourceEntity)
      ) {
        if (this.sameTeam(sourceEntity)) return true

        const newDamage       = weapon && this.weaponManager.calculateDamage(weapon) || damage
        const customDamage    = newDamage !== damage

        if (typeof this.throttledIncomingUpdate === 'undefined') {
          this.throttledIncomingUpdate = throttle(this.updateIncomingDamage, 200)
        }

        this.summaryDamage += newDamage
        this.throttledIncomingUpdate(sourceEntity, weapon, customDamage)

        if (customDamage) return true
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Throttle update incoming damage
   * @param {PlayerMp} sourceEntity 
   * @param {number} weapon 
   * @param {boolean} customDamage (optional) - flag is it custom damage, default false
   */
  updateIncomingDamage(sourceEntity: PlayerMp, weapon: number, customDamage: boolean = false): void {
    try {
      if (typeof sourceEntity === 'undefined') return
  
      this.addAssist(sourceEntity)
      this.addDamageReceived(weapon, this.summaryDamage)
      this.damageNotify(sourceEntity, this.summaryDamage, weapon)
  
      if (customDamage) {
        const health          = this.player.getHealth() - this.summaryDamage
        this.player.health    = health
        this.summaryDamage    = 0
    
        mp.events.callRemote(SHARED.EVENTS.CLIENT_SET_PLAYER_DATA, JSON.stringify({ health }))
    
        if (health <= 0) {
          const deathParams = { killerId: sourceEntity.remoteId, reason: weapon }
          mp.events.callRemote(SHARED.EVENTS.CLIENT_PLAYER_DEATH, JSON.stringify(deathParams))
          this.hudManager.deathEffect.start()
        }
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
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
  playerDeath(player: PlayerMp, reason: number, killer?: PlayerMp): void {
    try {
      if (
        this.playerManager.hasState([SHARED.STATE.ALIVE, SHARED.STATE.DEAD])
        && this.playerManager.hasState([SHARED.STATE.ALIVE], killer)
        && this.player.customData.assist
        && killer
      ) {
        if (this.player.customData.assist[killer.remoteId]) delete this.player.customData.assist[killer.remoteId]
    
        mp.events.callRemote(SHARED.EVENTS.CLIENT_ASSIST_UPDATE, JSON.stringify(this.player.customData.assist))
        this.hudManager.deathEffect.start()
      }
    } catch (err) {
      if (this.errHandler.handle(err)) throw err
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
    try {
      if (this.playerManager.hasState([SHARED.STATE.ALIVE])) {
        this.addShotsFired()
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
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
  addShotsHit(hit: number = 1): void {
    mp.events.callRemote(SHARED.EVENTS.CLIENT_ROUND_STAT_UPDATE, "shotsHit", hit)
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

  /**
   * Notify a player about the damage
   */
  damageNotify(sourceEntity: PlayerMp, damage: number, weapon: RageEnums.Hashes.Weapon): void {
    const { x, y, z } = this.player.position
    const { x: targetX, y: targetY, z: targetZ } = sourceEntity.position
    const distance = +(mp.game.system.vdist(x, y, z, targetX, targetY, targetZ)).toFixed(2)
    const damageParams = { damage, weapon, distance }

    this.hudManager.damage.addIncomingDamage(damageParams)
    mp.events.callRemote(SHARED.EVENTS.CLIENT_DAMAGE_REQUEST_NOTIFY, sourceEntity.remoteId, JSON.stringify(damageParams))
  }
}

export { RoundStatManager }