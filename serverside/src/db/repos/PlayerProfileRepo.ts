import { singleton, inject, injectable } from "tsyringe"
import { PlayerProfile } from "../domains/PlayerProfile"
import { DomainConverter } from "../domains/DomainConverter"

/**
 * Player stats repostiroy class
 */
@singleton()
@injectable()
class PlayerProfileRepo {
  constructor(@inject(ENUMS.COLLECTIONS.PLAYERS) public readonly schema: PouchDB.Database<TYPES.PlayerProfileRecord>) {}

  /**
   * Get a player by player rgscId
   * @param {PlayerMp} player 
   */
  async getPlayerById(player: PlayerMp): Promise<PlayerProfile> {
    let playerStat: PlayerProfile

    try {
      const playerStatDTO = await this.schema.get(player.rgscId)

      playerStat = DomainConverter.fromDto(PlayerProfile, playerStatDTO)
      playerStat.setName(player.name)

      return playerStat
    } catch (err) {
      if (err.name === 'not_found') {
        playerStat = PlayerProfile.create(player)
        await playerStat.save(this)  

        return playerStat
      }

      throw err
    }
  }

  /**
   * Make the diff for upsert method
   * @param {SHARED.TYPES.PlayerStatDTO} state 
   */
  diffDelta(state: SHARED.TYPES.PlayerProfileDTO): PouchDB.UpsertDiffCallback<TYPES.PlayerProfileRecord> {
    return (doc): any => ({ ...doc, ...state })
  }
}

export { PlayerProfileRepo }