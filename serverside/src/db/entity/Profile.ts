import { Entity, PrimaryColumn, Column, Index, ObjectIdColumn, ObjectID } from 'typeorm'
import { DomainConverter } from "./DomainConverter"
import { PlayerStatUpdateError, InvalidLoginGroup } from "../../errors/PlayerErrors"
import { hash256, formatDate } from "../../utils"

const MINUTE = 1000 * 60

export type CEFProfileDTO = Exclude<SHARED.TYPES.ProfileDTO, 'rgscId' | 'group' | 'password' | 'previousNames' | 'registered'> | {
  previousNames: string
  registered: string
}

export type USER_GROUPS = Exclude<SHARED.GROUP, SHARED.GROUP.ROOT>

@Entity()
export class Profile {
  static readonly MMR_GAIN = 25
  static readonly EXP_GAIN = 50

  @ObjectIdColumn()
  id!: ObjectID

  @PrimaryColumn()
  rgscId!: string

  @Column()
  state!: SHARED.TYPES.ProfileDTO

  constructor(dto: SHARED.TYPES.ProfileDTO) {
    if (dto) {
      this.rgscId   = dto.rgscId
      this.state    = dto
    }
  }

  /**
   * Set the name of a player
   * @param {string} name - the new name
   */
  setName(name: string): void {
    if (name !== this.state.name) {
      const prevName    = this.state.name
      this.state.name   = name

      if (this.state.previousNames.indexOf(prevName) === -1) {
        this.state.previousNames = [...this.state.previousNames, prevName]
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
    if (data.rgscId !== this.rgscId) {
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
    this.state.exp      += Profile.EXP_GAIN * 2
    this.state.mmr      += Profile.MMR_GAIN
  }

  /**
   * Set lose
   */
  setLose(): void {
    this.state.losses   += 1
    this.state.exp      += Profile.EXP_GAIN
    this.state.mmr      -= Profile.MMR_GAIN
    if (this.state.mmr < 0) this.state.mmr = 0
  }

  /**
   * Set draw
   */
  setDraw(): void {
    this.state.draws    += 1
    this.state.exp      += Profile.EXP_GAIN
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
      && this.rgscId === player.rgscId
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
   * Return an available groups to login
   */
  get loginAvailableGroups(): SHARED.GROUP[] {
    return [SHARED.GROUP.ADMIN, SHARED.GROUP.MODERATOR]
  }

  /**
   * Create new player stats
   * @param {PlayerMp} player 
   */
  static create(player: PlayerMp): Profile {
    const dto: SHARED.TYPES.ProfileDTO = Profile.getDefault()

    dto.rgscId = player.rgscId
    dto.name   = player.name

    return new Profile(dto)
  }

  /**
   * Get default player stats DTO 
   */
  static getDefault(): SHARED.TYPES.ProfileDTO {
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