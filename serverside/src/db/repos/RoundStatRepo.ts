import { singleton, injectable, inject } from "tsyringe"
import { ErrorHandler } from "../../core/ErrorHandler"

/**
 * Round stats repostiroy class
 */
@singleton()
@injectable()
class RoundStatRepo {
  constructor(
    @inject(ENUMS.COLLECTIONS.ROUNDS) public readonly schema: PouchDB.Database<TYPES.RoundStatRecord>,
    readonly errHandler: ErrorHandler,
  ) {}

  /**
   * Get all matches in the last week
   */
  async getMatchesLastWeek(): Promise<SHARED.TYPES.RoundStatDTO[]> {
    try {
      const startkey = Date.now().toString()
      const endkey = (+this.getLastWeek()).toString()

      const docs = await this.schema.allDocs({
        startkey,
        endkey,
        limit: 100,
        descending: true
      })

      const promises: any[] = []
      const resulted_docs: SHARED.TYPES.RoundStatDTO[] = []

      docs.rows.forEach(({ id }) => {
        promises.push(
          this.schema.get(id)
            .then(doc => resulted_docs.push(doc))
        )
      })

      await Promise.all(promises)

      return resulted_docs

    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }

    return []
  }

  /**
   * Get all matches by player in the last week
   * @param {PlayerMp} player
   */
  async getMatchesLastWeekByPlayer(player: PlayerMp): Promise<SHARED.TYPES.RoundStatDTO[]> {
    const matches = await this.getMatchesLastWeek()

    return matches
      .filter(match => {
        match.DEFENDERS = match.DEFENDERS || []
        match.ATTACKERS = match.ATTACKERS || []
        return match.DEFENDERS.some(ppl => ppl.rgscId === player.rgscId)
          || match.ATTACKERS.some(ppl => ppl.rgscId === player.rgscId)
      })
  }

  /**
   * Make the diff for upsert method
   * @param {SHARED.TYPES.RoundStatDTO} state 
   */
  diffDelta(state: SHARED.TYPES.RoundStatDTO): PouchDB.UpsertDiffCallback<TYPES.RoundStatRecord> {
    return (doc): any => ({...doc, ...state})
  }

  /**
   * Get last week date
   */
  private getLastWeek(): Date {
    var today = new Date()
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
    return lastWeek
  }

}

export { RoundStatRepo }