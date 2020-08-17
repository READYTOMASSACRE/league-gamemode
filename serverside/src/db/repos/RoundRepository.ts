import { singleton, injectable, inject } from "tsyringe"
import { ErrorHandler } from "../../core/ErrorHandler"
import { Round } from "../entity/Round"
import { EntityRepository, AbstractRepository, MongoRepository, ObjectID } from "typeorm"

/**
 * Round stats repostiroy class
 */
@EntityRepository(Round)
class RoundRepository extends MongoRepository<Round> {
  /**
   * Get match by id
   * @param {number} id
   */
  async getMatchById(id: ObjectID): Promise<Round | undefined> {
    return this.findOne(id)
  }

  /**
   * Get all matches in the last week
   */
  async getMatchesLastWeek(rgscId: string): Promise<Round[]> {
    const startkey = (+this.getLastWeek())
    const endkey = Date.now()

    return this.find({
      where: {
        created_at: {
          $gt: startkey,
          $lt: endkey,
        },
        $or: [
          {'state.ATTACKERS.rgscId': { $eq: rgscId }},
          {'state.DEFENDERS.rgscId': { $eq: rgscId }},
        ],
      },
      order: { created_at: -1 },
    })
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

export { RoundRepository }