import { DomainConverter } from "./DomainConverter"
import { PlayerProfileRepo } from "../repos/PlayerProfileRepo"
import { PlayerStatUpdateError, InvalidLoginGroup } from "../../errors/PlayerErrors"
import { hash256, formatDate } from "../../utils"

const MINUTE = 1000 * 60

export type CEFProfileDTO = Exclude<SHARED.TYPES.PlayerProfileDTO, 'rgscId' | 'group' | 'password' | 'previousNames' | 'registered'> | {
  previousNames: string
  registered: string
}

export type USER_GROUPS = Exclude<SHARED.GROUP, SHARED.GROUP.ROOT>
/**
 * Player stats domain
 */
class PlayerProfile {
  static readonly MMR_GAIN = 25
  static readonly EXP_GAIN = 50

  constructor(public readonly state: SHARED.TYPES.PlayerProfileDTO) {}

  get id(): string {
    return this.state.rgscId
  }

  /**
   * Set the name of a player
   * @param {string} name - the new name
   */
  setName(name: string): void {
    if (name !== this.state.name) {
       this.state.name = name

       if (this.state.previousNames.indexOf(name) === -1) {
         this.state.previousNames = [...this.state.previousNames, name]
       }
    }
  }

  /**
   * Update player round data
   * @param {SHARED.TYPES.PlayerRoundStatDTO} data - data which should been updated
   * 
   * @throws {PlayerStatUpdateError}
   */
  updateRoundData(data: SHARED.TYPES.PlayerRoundStatDTO): void {
    if (data.rgscId !== this.id) {
      throw new PlayerStatUpdateError(SHARED.MSG.ERR_WRONG_PLAYER_DATA, mp.players.at(data.id))
    }

    this.state.matches    += 1
    this.state.kill       += data.kill
    this.state.death      += data.death
    this.state.assist     += data.assist
    this.state.shotsFired += data.shotsFired
    this.state.shotsHit   += data.shotsHit
    this.state.accuracy   = this.getAccuracy()

    this.updateTimePlayed(data.id)
  }

  /**
   * Set win
   */
  setWin(): void {
    this.state.wins     += 1
    this.state.exp      += PlayerProfile.EXP_GAIN * 2
    this.state.mmr      += PlayerProfile.MMR_GAIN
  }

  /**
   * Set lose
   */
  setLose(): void {
    this.state.losses   += 1
    this.state.exp      += PlayerProfile.EXP_GAIN
    this.state.mmr      -= PlayerProfile.MMR_GAIN
    if (this.state.mmr < 0) this.state.mmr = 0
  }

  /**
   * Set draw
   */
  setDraw(): void {
    this.state.draws    += 1
    this.state.exp      += PlayerProfile.EXP_GAIN
  }

  /**
   * Set group
   * @param {USER_GROUPS} group
   */
  setGroup(group: USER_GROUPS): boolean {
    this.state.group = group

    return true
  }

  /**
   * Get profile group
   */
  getGroup(): USER_GROUPS {
    return this.state.group
  }

  /**
   * Set user password
   * @param {string} password
   */
  setPassword(password: string): boolean {
    this.state.password = hash256(password)

    return true
  }

  /**
   * Check if password is valid
   * @param {string} password
   */
  isValidPassword(password: string): boolean {
    return hash256(password) === this.state.password
  }

  /**
   * Login into the adm/moderator groups
   * @param {string} password 
   */
  login(password: string): boolean {
    if (this.loginAvailableGroups.indexOf(this.state.group) === -1) {
      throw new InvalidLoginGroup()
    }

    return this.isValidPassword(password)
  }

  /**
   * Calcute the accuracy
   */
  getAccuracy(): number {
    return +(this.state.shotsHit / this.state.shotsFired).toFixed(2) || 0
  }

  /**
   * Update playing time
   * @param {number} id - player id
   */
  updateTimePlayed(id: number): void {
    const player = mp.players.at(id)

    if (
      mp.players.exists(player)
      && this.id === player.rgscId
      && player.playingTime
    ) {
      this.state.timePlayed += this.calculatePlayingTime(player)
    }
  }

  /**
   * Get CEF profile
   */
  toCefProfileDto(lang: string = 'en'): CEFProfileDTO {
    return {
      name          : this.state.name,
      registered    : formatDate(this.state.registered, lang),
      previousNames : this.state.previousNames.join(','),
      timePlayed    : this.state.timePlayed,
      matches       : this.state.matches,
      wins          : this.state.wins,
      losses        : this.state.losses,
      kill          : this.state.kill,
      death         : this.state.death,
      assist        : this.state.assist,
      shotsFired    : this.state.shotsFired,
      shotsHit      : this.state.shotsHit,
      accuracy      : this.state.accuracy,
      mmr           : this.state.mmr,
      exp           : this.state.exp,
      lvl           : this.state.lvl,
      draws         : this.state.draws,
    }
  }

  /**
   * Calculate player's playing time
   * @param player - player which playing time will be updated
   * 
   * @throws {PlayerStatUpdateError}
   */
  private calculatePlayingTime(player: PlayerMp): number {
    if (!player.playingTime) {
      throw new PlayerStatUpdateError(
        SHARED.MSG.ERR_INVALID_PLAYING_TIME,
        player,
        player.name,
      )
    }
    const now = Date.now()

    const playingTime = +((now - player.playingTime) / MINUTE).toFixed(2)
    player.playingTime = now

    return playingTime
  }

  /**
   * Save the current player stat
   * @param {PlayerProfileRepo} repo - the repository of a player stat domain
   */
  async save(repo: PlayerProfileRepo): Promise<boolean> {
    const deltaFunc   = repo.diffDelta(this.state)
    const response    = await repo.schema.upsert(this.id, deltaFunc)

    return response.updated
  }

  /**
   * Return an available groups to login
   */
  get loginAvailableGroups(): SHARED.GROUP[] {
    return [SHARED.GROUP.ADMIN, SHARED.GROUP.MODERATOR]
  }

  /**
   * Create new player stats
   * @param {PlayerMp} player 
   */
  static create(player: PlayerMp): PlayerProfile {
    const dto: SHARED.TYPES.PlayerProfileDTO = PlayerProfile.getDefault()

    dto.rgscId = player.rgscId
    dto.name   = player.name

    return DomainConverter.fromDto(PlayerProfile, dto)
  }

  /**
   * Get default player stats DTO 
   */
  static getDefault(): SHARED.TYPES.PlayerProfileDTO {
    return {
      rgscId        : "",
      name          : "",
      registered    : Date.now(),
      previousNames : [],
      timePlayed    : 0,
      group         : SHARED.GROUP.USER,
      password      : "",
      matches       : 0,
      wins          : 0,
      losses        : 0,
      kill          : 0,
      death         : 0,
      assist        : 0,
      shotsFired    : 0,
      shotsHit      : 0,
      accuracy      : 0,
      mmr           : 0,
      exp           : 0,
      lvl           : 1,
      draws         : 0,
    }
  }
}

export { PlayerProfile }