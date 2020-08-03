import { DomainConverter } from "./DomainConverter"
import { validatorFactory } from "../../validators/validatorFactory"
import { operationFactory } from "../../validators/operationFactory"
import { logMethod } from "../../utils"
import { DEBUG } from "../../bootstrap"
import { RoundStatRepo } from "../repos/RoundStatRepo"
import { RoundStatGetError, RoundStatUpdateError, NotFoundNotifyError } from "../../errors/PlayerErrors"
import { IsNotExistsError, InvalidTypeError } from "../../errors/LogErrors"

type RoundIgnoredKeys = 'id' | 'rgscId' | 'win' | 'draw' | 'accuracy'
type RoundStatEditableKeys = Exclude<keyof SHARED.TYPES.PlayerRoundStatDTO, RoundIgnoredKeys>
export type RoundKeyValueCollection = { [key in RoundStatEditableKeys]: string }

/**
 * Round stats domain
 */
class RoundStat {
  static validators: RoundKeyValueCollection = {
    kill              : "number",
    death             : "number",
    assist            : "number",
    damage            : "numberObject",
    damageReceived    : "numberObject",
    shotsFired        : "number",
    shotsHit          : "number",
  }

  static operations: RoundKeyValueCollection = {
    kill              : "add",
    death             : "add",
    assist            : "add",
    damage            : "addObject",
    damageReceived    : "addObject",
    shotsFired        : "add",
    shotsHit          : "add",
  }

  constructor(
    public readonly state: SHARED.TYPES.RoundStatDTO,
  ) {
  }

  get id(): string {
    return this.state.created_at.toString()
  }

  /**
   * Get round stats by player
   * @param player
   * 
   * @throws {RoundStatGetError}
   */
  getPlayerRoundData(player: PlayerMp): SHARED.TYPES.PlayerRoundStatDTO {
    const teamId = player.sharedData.teamId

    if (teamId === SHARED.TEAMS.SPECTATORS) {
      throw new RoundStatGetError(SHARED.MSG.ERR_WRONG_PLAYER_ID, player)
    }

    const dto = this.state[teamId].find(ppl => ppl.id === player.id)

    if (!dto) {
      throw new RoundStatGetError(SHARED.MSG.ERR_WRONG_PLAYER_ID, player)
    }

    return dto
  }

  /**
   * Replace round stats by player, key and value
   * @param {PlayerMp} player
   * @param {K} key - key of player round DTO
   * @param {SHARED.TYPES.PlayerRoundStatDTO[K]} data - value of player round DTO
   */
  setPlayerRoundData<K extends keyof RoundKeyValueCollection>(player: PlayerMp, key: K, data: SHARED.TYPES.PlayerRoundStatDTO[K]): boolean {
    const stateIndex = this.getStateIndex(player)
    const validator = RoundStat.getValidator(key)

    const teamId = player.sharedData.teamId

    if (teamId === SHARED.TEAMS.SPECTATORS) {
      throw new RoundStatGetError(SHARED.MSG.ERR_WRONG_PLAYER_ID, player)
    }

    if (!validator(data)) return false

    this.state[teamId][stateIndex][key] = data

    if (['shotsFired', 'shotsHit'].indexOf(key) !== -1) {
      this.state[teamId][stateIndex]["accuracy"] = RoundStat.calculateAccuracy(this.state[teamId][stateIndex])
    }

    return true
  }

  /**
   * Update round stats by player, key and value with using the operations
   * @param {PlayerMp} player
   * @param {K} key - key of player round DTO
   * @param {SHARED.TYPES.PlayerRoundStatDTO[K]} data - value of player round DTO
   */
  @logMethod(DEBUG)
  updatePlayerRoundData<K extends keyof RoundKeyValueCollection>(player: PlayerMp, key: K, data: SHARED.TYPES.PlayerRoundStatDTO[K]): boolean {
    const stateIndex = this.getStateIndex(player)
    const validator = RoundStat.getValidator(key)

    const teamId = player.sharedData.teamId

    if (teamId === SHARED.TEAMS.SPECTATORS) {
      throw new RoundStatGetError(SHARED.MSG.ERR_WRONG_PLAYER_ID, player)
    }

    if (!validator(data)) return false

    const updateOperation = RoundStat.getOperation(key)
    this.state[teamId][stateIndex][key] = updateOperation(this.state[teamId][stateIndex][key], data)
    
    if (['shotsFired', 'shotsHit'].indexOf(key) !== -1) {
      this.state[teamId][stateIndex]["accuracy"] = RoundStat.calculateAccuracy(this.state[teamId][stateIndex])
    }

    return true
  }

  /**
   * Set team winners
   * @param {SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS | false} winner 
   */
  setWinner(winner: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS | false): boolean {
    this.state.winner = winner

    return true
  }

  /**
   * Check if round is draw
   */
  isDraw(): boolean {
    return this.state.winner === false
  }

  /**
   * Check if player is winner
   * @param {PlayerMp} player 
   */
  isPlayerWinner(player: PlayerMp): boolean {
    if (!this.state.winner) return false

    const [teamId] = this.getPlayerTeam(player)

    return teamId === this.state.winner
  }

  /**
   * Get player's team
   * @param {PlayerMp} player 
   */
  getPlayerTeam(player: PlayerMp): [SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS, number] {
    const attIndex = this.getAttackerIndex(player)
    const defIndex = this.getDefenderIndex(player)

    if (attIndex === -1 && defIndex === -1) {
      throw new NotFoundNotifyError(SHARED.MSG.ERR_ROUND_PLAYER_NOT_FOUND, player)
    }

    return attIndex === -1
      ? [SHARED.TEAMS.DEFENDERS, defIndex]
      : [SHARED.TEAMS.ATTACKERS, attIndex]
  }

  /**
   * Get player's round statistic
   * @param {PlayerMp} player 
   */
  getPlayerRoundStat(player: PlayerMp): SHARED.TYPES.PlayerRoundStatDTO {
    const [teamId, playerIndex] = this.getPlayerTeam(player)

    return this.state[teamId][playerIndex]
  }

  /**
   * Check if player is in round as attacker
   * @param player 
   */
  getAttackerIndex(player: PlayerMp): number {
    return this.state.ATTACKERS.findIndex(ppl => ppl.rgscId === player.rgscId)
  }

  /**
   * Check if player is in round as defender
   * @param player 
   */
  getDefenderIndex(player: PlayerMp): number {
    return this.state.DEFENDERS.findIndex(ppl => ppl.rgscId === player.rgscId)
  }

  /**
   * Get player's KDA
   * @param {PlayerMp} player 
   */
  getPlayerKDA(player: PlayerMp): [number, number, number] {
    const { kill, death, assist } = this.getPlayerRoundStat(player)

    return [ kill, death, assist ]
  }

  /**
   * Save the current round stat
   * @param {RoundStatRepo} repo - the repository of a round stat domain
   */
  async save(repo: RoundStatRepo): Promise<boolean> {
    const deltaFunc   = repo.diffDelta(this.state)
    const response    = await repo.schema.upsert(this.id, deltaFunc)

    return response.updated
  }

  /**
   * Get state index of the player
   * @param {PlayerMp} player 
   * 
   * @throws {RoundStatUpdateError}
   */
  private getStateIndex(player: PlayerMp): number {
    const teamId = player.sharedData.teamId

    if (teamId === SHARED.TEAMS.SPECTATORS) {
      throw new RoundStatUpdateError(SHARED.MSG.ERR_WRONG_PLAYER_ID, player)
    }

    const stateIndex = this.state[teamId].findIndex(ppl => ppl.id === player.id)

    if (stateIndex === -1) {
      throw new RoundStatUpdateError(SHARED.MSG.ERR_WRONG_PLAYER_ID, player)
    }

    return stateIndex
  }

  /**
   * Get validator
   * 
   * @param {string} key 
   * 
   * @throws {IsNotExistsError}
   * @throws {InvalidTypeError}
   */
  static getValidator(key: keyof RoundKeyValueCollection) {
    if (!RoundStat.validators[key]) {
      throw new IsNotExistsError("Invalid key " + key)
    }

    const validator = validatorFactory(RoundStat.validators[key] as any)

    if (!validator || typeof validator !== 'function') {
      throw new InvalidTypeError("Invalid validator")
    }

    return validator
  }

  /**
   * Get operation
   * 
   * @param {string} key 
   * 
   * @throws {IsNotExistsError}
   * @throws {InvalidTypeError}
   */
  static getOperation(key: keyof RoundKeyValueCollection) {
    if (!RoundStat.operations[key]) {
      throw new IsNotExistsError("Invalid key " + key)
    }

    const operation = operationFactory(RoundStat.operations[key] as any)

    if (!operation || typeof operation !== 'function') {
      throw new InvalidTypeError("Invalid operation")
    }

    return operation
  }
  /**
   * Create new round stats
   * @param {number} startDate - start date of the round
   * @param {PlayerMp[]} players (optional)
   */
  static create(startDate?: number, players: PlayerMp[] = []): RoundStat {
    const [attackers, defenders] = RoundStat.preparePlayers(players)

    const dto: SHARED.TYPES.RoundStatDTO = {
      created_at: startDate || Date.now(),
      winner: false,
      ATTACKERS: attackers,
      DEFENDERS: defenders,
    }

    return DomainConverter.fromDto(RoundStat, dto)
  }

  /**
   * Prepare players dto objects
   * @param {PlayerMp[]} players 
   */
  static preparePlayers(players: PlayerMp[]): [SHARED.TYPES.PlayerRoundStatDTO[], SHARED.TYPES.PlayerRoundStatDTO[]] {
    const attackers = players
      .filter(player => player.sharedData.teamId === SHARED.TEAMS.ATTACKERS)
      .map(player => {
        const dto   = RoundStat.getDefault()
        dto.id      = player.id
        dto.rgscId  = player.rgscId

        return dto
      })

    const defenders = players
      .filter(player => player.sharedData.teamId === SHARED.TEAMS.DEFENDERS)
      .map(player => {
        const dto   = RoundStat.getDefault()
        dto.id      = player.id
        dto.rgscId  = player.rgscId

        return dto
      })

    return [attackers, defenders]
  }

  /**
   * Get default player round stats DTO 
   */
  static getDefault(): SHARED.TYPES.PlayerRoundStatDTO {
    return {
      id                : 0,
      rgscId            : "",
      kill              : 0,
      death             : 0,
      assist            : 0,
      damage            : {},
      damageReceived    : {},
      shotsFired        : 0,
      shotsHit          : 0,
      accuracy          : 0,
    }
  }

  /**
   * Calcute the accuracy
   */
  static calculateAccuracy(dto: SHARED.TYPES.PlayerRoundStatDTO): number {
    return +(dto.shotsHit / dto.shotsFired).toFixed(2) || 0
  }

  /**
   * Merge two player round stat dto
   * @param {SHARED.TYPES.RoundStatDTO} accumulator - the DTO which will be merge
   * @param {Partial<SHARED.TYPES.RoundStatDTO>} value - the DTO which data will be used
   */
  static mergePlayer(accumulator: SHARED.TYPES.PlayerRoundStatDTO, value: Partial<SHARED.TYPES.PlayerRoundStatDTO>): SHARED.TYPES.PlayerRoundStatDTO {
    Object.entries(accumulator)
      .forEach(([key, accumulatorValue]) => {
        const dtoKey = key as keyof RoundKeyValueCollection
        const dtoValue = value[dtoKey]
        if (typeof dtoValue !== 'undefined' && RoundStat.validators[dtoKey] && RoundStat.operations[dtoKey]) {
          const validator = RoundStat.getValidator(dtoKey)
          if (validator(dtoValue)) {
            const operation = RoundStat.getOperation(dtoKey)
            accumulator = {...accumulator, ...{ [dtoKey]: operation(accumulatorValue, dtoValue) } }
          }
        }
      })

    accumulator["accuracy"] = RoundStat.calculateAccuracy(accumulator)

    return accumulator
  }
}

export { RoundStat }