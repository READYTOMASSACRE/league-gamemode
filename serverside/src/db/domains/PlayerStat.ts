import { DomainConverter } from "./DomainConverter"
import { PlayerStatRepo } from "../repos/PlayerStatRepo"
import { PlayerStatUpdateError } from "../../errors/PlayerErrors"

const MINUTE = 1000 * 60

/**
 * Player stats domain
 */
class PlayerStat {
  static readonly MMR_GAIN = 25
  static readonly EXP_GAIN = 50

  constructor(public readonly state: SHARED.TYPES.PlayerStatDTO) {}

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

    if (data.win) {
      this.state.wins     += 1
      this.state.exp      += PlayerStat.EXP_GAIN * 2
      this.state.mmr      += PlayerStat.MMR_GAIN
    } else if(data.draw) {
      this.state.draws    += 1
      this.state.exp      += PlayerStat.EXP_GAIN
    } else {
      this.state.losses   += 1
      this.state.exp      += PlayerStat.EXP_GAIN
      this.state.mmr      -= PlayerStat.MMR_GAIN
      if (this.state.mmr < 0) this.state.mmr = 0
    }

    this.updateTimePlayed(data.id)
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
   * @param {PlayerStatRepo} repo - the repository of a player stat domain
   */
  async save(repo: PlayerStatRepo): Promise<boolean> {
    const deltaFunc   = repo.diffDelta(this.state)
    const response    = await repo.schema.upsert(this.id, deltaFunc)

    return response.updated
  }

  /**
   * Create new player stats
   * @param {PlayerMp} player 
   */
  static create(player: PlayerMp): PlayerStat {
    const dto: SHARED.TYPES.PlayerStatDTO = PlayerStat.getDefault()

    dto.rgscId = player.rgscId
    dto.name   = player.name

    return DomainConverter.fromDto(PlayerStat, dto)
  }

  /**
   * Get default player stats DTO 
   */
  static getDefault(): SHARED.TYPES.PlayerStatDTO {
    return {
      rgscId        : "",
      name          : "",
      registered    : Date.now(),
      previousNames : [],
      timePlayed    : 0,
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

export { PlayerStat }