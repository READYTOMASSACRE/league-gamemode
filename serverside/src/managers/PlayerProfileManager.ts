import { singleton, injectable } from "tsyringe"
import { PlayerProfileRepo } from "../db/repos/PlayerProfileRepo"
import { DomainConverter } from "../db/domains/DomainConverter"
import { PlayerProfile } from "../db/domains/PlayerProfile"
import { logMethod } from "../utils"
import { DEBUG } from "../bootstrap"
import { ErrorHandler } from "../core/ErrorHandler"
import { IsNotExistsError } from "../errors/LogErrors"

/**
 * Class to manage player stats
 */
@singleton()
@injectable()
class PlayerProfileManager {
  constructor(
    readonly repo: PlayerProfileRepo,
    readonly errHandler: ErrorHandler,
  ) {
    this.playerLogin = this.playerLogin.bind(this)
  }

  /**
   * Log in
   * @param {PlayerMp} player 
   */
  async playerLogin(player: PlayerMp): Promise<void> {
    try {
      const profile = await this.repo.getPlayerById(player)
      player.sharedData.profile = DomainConverter.toDto(profile)

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

      if (mp.players.exists(player) && player.sharedData.profile) {
        this.updateRoundStats(player, stat)
        promises.push(this.save(player))
      }
    })

    return Promise.all(promises)
  }

  /**
   * Update player's round statistics
   * @param {PlayerMp} player - the player who will be updated
   * @param {SHARED.TYPES.PlayerRoundStatDTO} dto - round data
   */
  updateRoundStats(player: PlayerMp, dto: SHARED.TYPES.PlayerRoundStatDTO): boolean {
    const profile = this.getDomain(player)
    profile.updateRoundData(dto)

    return this.update(player, profile)
  }

  /**
   * Update players' profile in shared data
   * 
   * @param {PlayerMp} player 
   * @param {PlayerProfile} profile 
   */
  update(player: PlayerMp, profile: PlayerProfile): boolean {
    player.sharedData.profile = DomainConverter.toDto(profile)

    return true
  }

  /**
   * Save player data to db
   * @param {PlayerMp} player - player who will be updated
   */
  @logMethod(DEBUG)
  async save(player: PlayerMp): Promise<boolean> {
    const profile = DomainConverter.fromDto(PlayerProfile, player.sharedData.profile)

    try {
      return await profile.save(this.repo)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err

      return false
    }
  }

  /**
   * Get player profile domain
   * @param {PlayerMp} player 
   */
  getDomain(player: PlayerMp): PlayerProfile {
    if (!player.sharedData.profile) {
      throw new IsNotExistsError("PlayerProfile dto is not exists")
    }

    return DomainConverter.fromDto(PlayerProfile, player.sharedData.profile)
  }
}

export { PlayerProfileManager }