import { Dummy } from "../../entities/Dummy"
import { singleton, injectable } from "tsyringe"
import { Language } from "../../core/Language"

/**
 * Class to manage round stats through the dummy
 */
@singleton()
@injectable()
class DummyRoundStatManager {
  private readonly type = SHARED.ENTITIES.ROUND_STAT
  private _dummy?: Dummy<SHARED.ENTITIES.ROUND_STAT>

  constructor(readonly lang: Language) {}

  /**
   * Register all existing dummies
   */
  registerDummies(): void {
    mp.dummies.forEachByType(this.type, entity => {
      this._dummy = new Dummy(this.type, entity)
    })
  }

  /**
   * Get the score by team id
   * @param {Exclude<SHARED.TEAMS, SHARED.TEAMS.SPECTATORS>} teamId 
   */
  getScore(teamId: Exclude<SHARED.TEAMS, SHARED.TEAMS.SPECTATORS>): number {
    return this.dummy.data[teamId].score
  }

  /**
   * Get round stat dummy
   */
  get dummy() {
    if (!this._dummy) throw new ReferenceError(this.lang.get(SHARED.MSG.ERR_NOT_FOUND))

    return this._dummy
  }
}

export { DummyRoundStatManager }