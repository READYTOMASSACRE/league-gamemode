import { singleton, inject, injectable } from "tsyringe"
import { PlayerStat } from "../domains/PlayerStat"
import { DomainConverter } from "../domains/DomainConverter"

/**
 * Player stats repostiroy class
 */
@singleton()
@injectable()
class PlayerStatRepo {
  constructor(@inject(ENUMS.COLLECTIONS.PLAYERS) public readonly schema: PouchDB.Database<TYPES.PlayerStatRecord>) {}

  /**
   * Get a player by player rgscId
   * @param {PlayerMp} player 
   */
  async getPlayerById(player: PlayerMp): Promise<PlayerStat> {
    let playerStat: PlayerStat

    try {
      const playerStatDTO = await this.schema.get(player.rgscId)

      playerStat = DomainConverter.fromDto(PlayerStat, playerStatDTO)
      playerStat.setName(player.name)

      return playerStat
    } catch (err) {
      if (err.name === 'not_found') {
        playerStat = PlayerStat.create(player)
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
  diffDelta(state: SHARED.TYPES.PlayerStatDTO): PouchDB.UpsertDiffCallback<TYPES.PlayerStatRecord> {
    return (doc): any => ({ ...doc, ...state })
  }
}

export { PlayerStatRepo }