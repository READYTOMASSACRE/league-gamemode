import { EntityRepository, MongoRepository, FindAndModifyWriteOpResultObject } from "typeorm"
import { Profile } from "../entity/Profile"

/**
 * Player stats repostiroy class
 */
@EntityRepository(Profile)
class ProfileRepository extends MongoRepository<any> {
  /**
   * Get a player by player rgscId
   * @param {PlayerMp} player 
   */
  async getPlayerById(player: PlayerMp): Promise<Profile | undefined> {
    return this.findOne({
      where: { rgscId: player.rgscId }
    })
  }

  async getTopPlayers(take: number = 100): Promise<Profile[]> {
    return await this.find({
      order: { 'state.mmr': -1 },
      take,
    })
  }

  /**
   * Save a player's profile
   * @param {Profile} profile 
   */
  async saveProfile(profile: Profile): Promise<FindAndModifyWriteOpResultObject> {
    return this.findOneAndUpdate({ rgscId: profile.rgscId }, { $set: profile }, { upsert: true })
  }
}

export { ProfileRepository }