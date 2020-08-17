import { singleton, injectable } from "tsyringe"
import { DummyConfigManager } from "./dummies/DummyConfigManager"
import { ErrorHandler } from "../core/ErrorHandler"
import { weapons } from "../declarations/weapons"

@singleton()
@injectable()
class WeaponManager {
  constructor (
    readonly configManager    : DummyConfigManager,
    readonly errHandler       : ErrorHandler,
  ) {}

  /**
   * Calculates a damage from config
   * @param {RageEnums.Hashes.Weapon} weapon 
   */
  calculateDamage(weapon: RageEnums.Hashes.Weapon): number | false {
    try {
      const weaponName = this.getWeaponName(weapon)
      if (!weaponName) return false

      const config = this.configManager.getDamageConfig()
  
      if (typeof config.SPECIFIC[weaponName] !== 'undefined') {
        return config.SPECIFIC[weaponName]
      }
  
      const category = this.getWeaponCategory(weaponName)
      if (typeof config.GROUP[category] !== 'undefined') {
        return config.GROUP[category]
      }
  
      return false
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err

      return false
    }
  }

  /**
   * Get a weapon name, if exists
   * 
   * @param {RageEnums.Hashes.Weapon} weapon 
   */
  getWeaponName(weapon: RageEnums.Hashes.Weapon): string | undefined {
    const weaponName = weapons[weapon]
    if (!weaponName) return undefined
    
    return 'weapon_' + weaponName.replace('weapon_', '')
  }

  /**
   * Get a category of the weapon
   * @param {string} weaponName - a weapon's name
   */
  getWeaponCategory(weaponName: string): string {
    const weapons = this.configManager.getWeapons()

    const [[ category ]] = Object
      .entries(weapons)
      .filter(([category, weaponSets]) => weaponSets.indexOf(weaponName) !== -1)

    return category
  }
}

export { WeaponManager }