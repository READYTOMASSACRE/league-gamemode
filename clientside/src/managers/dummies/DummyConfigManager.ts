import { Dummy } from "../../entities/Dummy"
import { singleton, injectable } from "tsyringe"

/**
 * A manager to handle dummies
 */
@singleton()
@injectable()
class DummyConfigManager {
  private readonly type = SHARED.ENTITIES.CONFIG
  private _dummy?: Dummy<SHARED.ENTITIES.CONFIG>

  constructor() {
    this.registerDummies = this.registerDummies.bind(this)
  }

  /**
   * Register all existing dummies
   */
  registerDummies(): void {
    mp.dummies.forEachByType(this.type, entity => {
      this._dummy = new Dummy(this.type, entity)
    })
  }

  /**
   * Return the name of the server
   */
  getServerName(): string {
    return this.dummy.data.SERVER_NAME
  }
  /**
   * Get default language from the server
   */
  getDefaultLanguage(): string {
    return this.dummy.data.LANGUAGE
  }

  /**
   * Get the data of a team
   * @param {T} teamId
   */
  getTeam<T extends SHARED.TEAMS>(teamId: T): SHARED.TYPES.Teams[T] {
    return this.dummy.data.TEAMS[teamId]
  }

  /**
   * Get the round interval from the server
   */
  getRoundIntervalMinutes(): number {
    return this.dummy.data.ROUND_TIME_INTERVAL
  }

  /**
   * Get the vote interval from the server
   */
  getVoteIntervalSeconds(): number {
    return this.dummy.data.VOTE.TIME
  }

  /**
   * Get a nametag config
   */
  getNameTagConfig(): SHARED.TYPES.NametagConfig
  {
    return this.dummy.data.HUD.NAMETAG
  }

  /**
   * Get a global hud config
   */
  getGlobalHudConfig(): SHARED.TYPES.GlobalHudConfig
  {
    return this.dummy.data.HUD.GLOBAL
  }

  /**
   * Get config dummy
   */
  get dummy() {
    if (!this._dummy) throw new ReferenceError(SHARED.MSG.ERR_NOT_FOUND)

    return this._dummy
  }
}

export { DummyConfigManager }