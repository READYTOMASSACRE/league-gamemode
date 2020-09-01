import { singleton, injectable } from "tsyringe"
import { Profile } from "../db/entity/Profile"
import { logMethod } from "../utils"
import { DEBUG } from "../bootstrap"
import { ErrorHandler } from "../core/ErrorHandler"
import { NotFoundNotifyError } from "../errors/PlayerErrors"
import { DomainConverter } from "../db/entity/DomainConverter"
import { getCustomRepository } from "typeorm"
import { ProfileRepository } from "../db/repos/ProfileRepository"

/**
 * Class to manage player stats
 */
@singleton()
@injectable()
class PlayerProfileManager {
  public repository?: ProfileRepository

  constructor(readonly errHandler: ErrorHandler) {
    this.playerLogin = this.playerLogin.bind(this)
  }

  load(): void {
    this.repository = getCustomRepository(ProfileRepository)
  }

  /**
   * Log in
   * @param {PlayerMp} player 
   */
  async playerLogin(player: PlayerMp): Promise<void> {
    try {
      if (this.repository) {
        let profile = await this.repository.getPlayerById(player)

        if (!profile) {
          profile = Profile.create(player)
          this.repository.saveProfile(profile)
        }

        player.sharedData.profile = DomainConverter.toDto(profile)
  
        player.call(SHARED.EVENTS.SERVER_PLAYER_LOGIN_SUCCESS, [])
        mp.events.call(SHARED.EVENTS.SERVER_PLAYER_LOGIN_SUCCESS, player)
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
      player.call(SHARED.EVENTS.SERVER_PLAYER_LOGIN_FAILURE, [])
      mp.events.call(SHARED.EVENTS.SERVER_PLAYER_LOGIN_FAILURE, player)
    }
  }

  /**
   * Save round data per player
   * @param {SHARED.TYPES.PlayerRoundStatDTO[]} stats round stat
   * @param {SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS | false} teamWinner
   */
  @logMethod(DEBUG)
  saveStats(stats: SHARED.TYPES.PlayerRoundStatDTO[], teamWinner: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS | false, playersInRound: PlayerMp[]): Promise<any> {
    const promises: any = []

    stats.forEach(stat => {
      const player = mp.players.at(stat.id)

      if (mp.players.exists(player) && player.sharedData.profile) {
        const teamId = player.sharedData.teamId
        const teammates = playersInRound.filter(ppl => ppl.sharedData.teamId === teamId)

        this.updateRoundStats(player, stat, teamWinner, teammates.length)
        promises.push(this.save(player))
      }
    })

    return Promise.all(promises)
  }

  /**
   * Update player's round statistics
   * @param {PlayerMp} player - the player who will be updated
   * @param {SHARED.TYPES.PlayerRoundStatDTO} dto - round data
   * @param {SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS | false} dto - round data
   */
  updateRoundStats(player: PlayerMp, dto: SHARED.TYPES.PlayerRoundStatDTO, teamWinner: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS | false, teammatesCount: number): boolean {
    const teamId  = player.sharedData.teamId
    const profile = this.getDomain(player)
    profile.updateRoundData(dto)

    if (teamWinner === teamId) {
      profile.setWin(teammatesCount)
    } else if (teamWinner === false) {
      profile.setDraw()
    } else {
      profile.setLose(teammatesCount)
    }

    return this.updateSharedProfile(player, profile)
  }

  /**
   * Update players' profile in shared data
   * 
   * @param {PlayerMp} player 
   * @param {PlayerProfile} profile 
   */
  updateSharedProfile(player: PlayerMp, profile: Profile): boolean {
    player.sharedData.profile = DomainConverter.toDto(profile)

    return true
  }

  /**
   * Save player data to db
   * @param {PlayerMp} player - player who will be updated
   */
  @logMethod(DEBUG)
  async save(player: PlayerMp): Promise<boolean> {
    if (!this.repository) return false

    const profile = DomainConverter.fromDto(Profile, player.sharedData.profile)

    try {
      const response = await this.repository.saveProfile(profile)

      return !!response.ok
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err

      return false
    }
  }

  /**
   * Get player profile domain
   * @param {PlayerMp} player 
   */
  getDomain(player: PlayerMp, notifiedPlayer?: PlayerMp): Profile {
    if (!player.sharedData.profile) {
      throw new NotFoundNotifyError(SHARED.MSG.ERR_PROFILE_NOT_FOUND, notifiedPlayer || player)
    }

    return DomainConverter.fromDto(Profile, player.sharedData.profile)
  }
}

export { PlayerProfileManager }