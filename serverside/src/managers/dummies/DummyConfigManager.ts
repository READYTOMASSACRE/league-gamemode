import { singleton, injectable, inject } from "tsyringe"
import { Dummy } from "../../entities/Dummy"
import { Config } from "../../core/Config"
import { WeaponManager } from "../WeaponManager"
import { getRandomInt } from "../../utils"
import { IsNotExistsError } from "../../errors/LogErrors"
import { Application } from "../../core/Application"

/**
 * Class to manage config through the dummy
 */
@injectable()
@singleton()
class DummyConfigManager implements INTERFACES.Manager {
  private _dummy?: Dummy<SHARED.ENTITIES.CONFIG>

  constructor(
    @inject(Config) private readonly config: Config,
    private readonly weaponManager: WeaponManager,
  ) {}

  /**
   * Load config to players from the server
   */
  load(): void {
    this._dummy = new Dummy(SHARED.ENTITIES.CONFIG, {
      SERVER_NAME           : mp.config.name,
      LOBBY                 : this.config.get('LOBBY'),
      TEAMS                 : this.config.get('TEAMS'),
      WEAPONS               : this.config.get('WEAPONS'),
      WEAPON_SET            : this.weaponManager.weaponSet,
      WEAPON_DAMAGE         : this.config.get('WEAPON_DAMAGE'),
      TEAM_SELECTOR         : this.config.get('TEAM_SELECTOR'),
      LANGUAGE              : this.config.get('LANGUAGE'),
      ROUND_TIME_INTERVAL   : this.config.get('ROUND_TIME_INTERVAL_MINUTES'),
      VOTE                  : this.config.get('VOTE'),
      HUD                   : this.config.get('HUD'),
      GAMEMODE              : Application.GAMEMODE,
      VERSION               : Application.VERSION,
      EFFECTS               : this.config.get('EFFECTS'),
    })
  }

  /**
   * Getting random skin by teamId
   * @param {SHARED.TEAMS} teamId
   */
  getRandomSkin(teamId: SHARED.TEAMS): string {
    const skins = this.dummy.data.TEAMS[teamId].SKINS

    return skins[getRandomInt(skins.length)]
  }

  /**
   * Getting team data by teamId
   * @param {SHARED.TEAMS} teamId 
   */
  getTeamData<T extends SHARED.TEAMS>(teamId: T): SHARED.TYPES.Teams[T] {
    return this.dummy.data.TEAMS[teamId]
  }

  get dummy() {
    if (!this._dummy) throw new IsNotExistsError("Dummy not found")

    return this._dummy
  }

  /**
   * Get an effects
   */
  getEffects(): SHARED.TYPES.EffectsConfig {
    return this.dummy.data.EFFECTS
  }
}

export { DummyConfigManager }