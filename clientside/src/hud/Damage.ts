import { Hud } from "./Hud"
import { getWeaponName } from "../utils"

type DamageParams = {
  damage    : number
  weapon    : RageEnums.Hashes.Weapon
  distance? : number
}

type DamageInfo = DamageParams & { updated: number }

/**
 * Hud element - Damage
 */
class Damage extends Hud {
  static readonly TIME = 3

  private time: number = 0
  private in?: DamageInfo
  private out?: DamageInfo

  /**
   * @inheritdoc
   */
  prepare(): void {
    const { TIME }  = this.dummyConfig.getDamageHudConfig()
    this.time       = (TIME || Damage.TIME) * 1000
  }

  /**
   * @inheritdoc
   */
  start(): void {
    mp.events.add(RageEnums.EventKey.RENDER, this.render)
    this.startTick()
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    mp.events.remove(RageEnums.EventKey.RENDER, this.render)
    this.stopTick()
  }

  /**
   * @inheritdoc
   */
  render(): void {
    try {
      const textParams = this.textParams
      textParams.scale = [ 0.5, 0.5 ]
  
      if (this.in) {
        textParams.color = this.RED
        const textIn = this.getFormattedText(this.in)
        mp.game.graphics.drawText(textIn, [0.55, 0.55], textParams)
      }
  
      if (this.out) {
        textParams.color = this.GREEN
        const textOut = this.getFormattedText(this.out)
        mp.game.graphics.drawText(textOut, [0.55, 0.5], textParams)
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Calculate expired time on every tick
   */
  tick(): void {
    if (this.in && this.isExpired(this.in)) {
      this.in = undefined
    }
    if (this.out && this.isExpired(this.out)) {
      this.out = undefined
    }
  }

  /**
   * Adding an incoming damage to the render
   * @param {number} damage 
   */
  addIncomingDamage(damageParams: DamageParams): void {
    if (!this.in) this.in = this.getDefault()

    this.in.damage += damageParams.damage
    this.in.weapon = damageParams.weapon

    if (damageParams.distance) {
      this.in.distance = damageParams.distance
    }

    this.in.updated = Date.now()

    mp.game.audio.playSoundFrontend(-1, "ON", "NOIR_FILTER_SOUNDS", true)
  }

  /**
   * Adding an outcoming damage to the render
   * @param {number} damage 
   */
  addOutcomingDamage(damageParams: DamageParams): void {
    if (!this.out) this.out = this.getDefault()

    this.out.damage += damageParams.damage
    this.out.weapon = damageParams.weapon

    if (damageParams.distance) {
      this.out.distance = damageParams.distance
    }
    this.out.updated = Date.now()

    mp.game.audio.playSoundFrontend(-1, "TENNIS_MATCH_POINT", "HUD_AWARDS", true)
  }

  /**
   * Get default damage params
   */
  getDefault(): DamageInfo {
    return {
      damage    : 0,
      weapon    : RageEnums.Hashes.Weapon.UNARMED,
      distance  : 0,
      updated   : Date.now(),
    }
  }

  /**
   * Check if an element is expired
   */
  isExpired(info: DamageInfo): boolean {
    return Date.now() - info.updated > this.time
  }

  /**
   * Get a damage info in a string
   * @param {DamageInfo} info 
   */
  getFormattedText(info: DamageInfo): string {
    const { damage, weapon, distance = 0 } = info

    const weaponName = getWeaponName(weapon)

    return `${damage}hp / ${weaponName} / ${distance} ft.`
  }

  get GREEN(): RGBA {
    return [84, 243, 140, 255]
  }

  get RED(): RGBA {
    return [243, 84, 84, 255]
  }
}

export { Damage }