import { app } from "../bootstrap"
import { singleton, inject, injectable, delay } from "tsyringe"
import { Config } from "../core/Config"
import { NotFoundNotifyError } from "../errors/PlayerErrors"

/**
 * Class to manage the weapons
 */
@injectable()
@singleton()
class WeaponManager {
  static readonly MAX_AMMO: number = app.getConfig().get('MAX_AMMO') || 1000
  static readonly MAX_WEAPON_SLOTS: number = app.getConfig().get('MAX_WEAPON_SLOTS') || 3

  private weapons: any
  private weaponsSetCategories: string[][]
  public readonly weaponSet: string[][]

  constructor(@inject(Config) readonly config: Config) {

    this.weaponRequest = this.weaponRequest.bind(this)

    this.weapons = this.config.get("WEAPONS")
    this.weaponsSetCategories = this.config.get('WEAPONS_SET')
    this.weaponSet = this.getWeaponSet()
  }

  /**
   * Rpc call
   * 
   * Fires when the player has made the choice
   * @param {string[]} choice 
   * @param {rpc.ProcedureListenerInfo} param1 
   */
  weaponRequest(choice: string[], { player }: rpc.ProcedureListenerInfo): void {
    if (this.isCorrectChoice(choice)) {
      this.giveWeapons(player as PlayerMp, choice)
    } else {
      throw new NotFoundNotifyError(SHARED.MSG.ERR_WEAPON_NOT_FOUND, player as PlayerMp)
    }
  }
  
  /**
   * Give the weapons to the player
   * @param {PlayerMp} player 
   * @param {string[]} choice - array of weapon hashes
   */
  giveWeapons(player: PlayerMp, choice: string[]) : void {
    player.removeAllWeapons()
    choice.forEach(hash => player.giveWeapon(mp.joaat(hash), WeaponManager.MAX_AMMO))
  }
  
  /**
   * Check if the choice is correct
   * @param {string[]} choice - array of weapon hashes
   */
  isCorrectChoice(choice: string[]) : boolean {
    const list = this.getList()

    return choice.length <= WeaponManager.MAX_WEAPON_SLOTS && choice.every(hash => list.indexOf(hash) !== -1)
  }

  /**
   * Get weapon list from the config
   */
  getList(): string[] {
    return Object
      .entries(this.weapons)
      .reduce((carry, currentValue) => {
        const [_, weapons]: [any, any] = currentValue

        return [...carry, ...weapons] as any
      }, [])
  }

  /**
   * Set the weapon list
   */
  private getWeaponSet(): string[][] {
    const weaponSet: string[][] = []

    if (Array.isArray(this.weaponsSetCategories) && typeof this.weapons === 'object') {
      this.weaponsSetCategories.forEach((packs, index) => {
        if (weaponSet[index] === undefined) weaponSet[index] = []
        packs.forEach(pack => {
          if (Array.isArray(this.weapons[pack])) weaponSet[index] = [...weaponSet[index], ...this.weapons[pack]]
        })
      })
    }

    return weaponSet
  }
}

export { WeaponManager }