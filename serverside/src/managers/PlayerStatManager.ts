import { singleton, injectable } from "tsyringe"
import { PlayerStatRepo } from "../db/repos/PlayerStatRepo"
import { DomainConverter } from "../db/domains/DomainConverter"
import { PlayerStat } from "../db/domains/PlayerStat"
import { logMethod } from "../utils"
import { DEBUG } from "../bootstrap"

/**
 * Class to manage player stats
 */
@singleton()
@injectable()
class PlayerStatManager {
  constructor(private readonly repo: PlayerStatRepo) {
    this.playerLogin = this.playerLogin.bind(this)
  }

  /**
   * Log in
   * @param {PlayerMp} player 
   */
  async playerLogin(player: PlayerMp): Promise<void> {
    try {
      const playerStat = await this.repo.getPlayerById(player)
      player.sharedData.stat = DomainConverter.toDto(playerStat)

      player.call(SHARED.EVENTS.SERVER_PLAYER_LOGIN_SUCCESS, [])
    } catch (err) {
      console.error(err)
      player.call(SHARED.EVENTS.SERVER_PLAYER_LOGIN_FAILURE, [])
    }
  }

  /**
   * Save round data per player
   * @param stats round stat
   * 
   * @throws {PlayerStatUpdateError}
   */
  @logMethod(DEBUG)
  saveStats(stats: SHARED.TYPES.PlayerRoundStatDTO[]): Promise<any> {
    const promises: any = []

    stats.forEach(stat => {
      const player = mp.players.at(stat.id)

      if (mp.players.exists(player) && player.sharedData.stat) {
        promises.push(this.save(player, stat))
      }
    })

    return Promise.all(promises)
  }

  /**
   * Save player data to db
   * @param player - player who will be updated
   * @param dto - data
   * 
   * @throws {PlayerStatUpdateError}
   */
  @logMethod(DEBUG)
  save(player: PlayerMp, dto: SHARED.TYPES.PlayerRoundStatDTO): Promise<boolean> {
    const playerStat = DomainConverter.fromDto(PlayerStat, player.sharedData.stat)
    playerStat.updateRoundData(dto)
    player.sharedData.stat = DomainConverter.toDto(playerStat)

    return playerStat.save(this.repo)
  }
}

export { PlayerStatManager }