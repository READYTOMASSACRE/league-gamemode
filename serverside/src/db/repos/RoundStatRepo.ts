import { singleton, injectable, inject } from "tsyringe"

/**
 * Round stats repostiroy class
 */
@singleton()
@injectable()
class RoundStatRepo {
  constructor(@inject(ENUMS.COLLECTIONS.ROUNDS) public readonly schema: PouchDB.Database<TYPES.RoundStatRecord>) {}

    /**
   * Make the diff for upsert method
   * @param {SHARED.TYPES.RoundStatDTO} state 
   */
  diffDelta(state: SHARED.TYPES.RoundStatDTO): PouchDB.UpsertDiffCallback<TYPES.RoundStatRecord> {
    return (doc): any => ({...doc, ...state})
  }
}

export { RoundStatRepo }