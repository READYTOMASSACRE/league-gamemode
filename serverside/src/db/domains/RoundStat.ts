import { DomainConverter } from "./DomainConverter"
import { validatorFactory } from "../../validators/validatorFactory"
import { operationFactory } from "../../validators/operationFactory"
import { logMethod } from "../../utils"
import { DEBUG } from "../../bootstrap"
import { RoundStatRepo } from "../repos/RoundStatRepo"
import { RoundStatGetError, RoundStatUpdateError } from "../../errors/PlayerErrors"
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
    teamId            : "string"
  }

  static operations: RoundKeyValueCollection = {
    kill              : "add",
    death             : "add",
    assist            : "add",
    damage            : "addObject",
    damageReceived    : "addObject",
    shotsFired        : "add",
    shotsHit          : "add",
    teamId            : "replace"
  }

  constructor(
    public readonly state: SHARED.TYPES.RoundStatDTO,
  ) {}

  get id(): string {
    return this.state.timestamp.toString()
  }

  /**
   * Get round stats by player
   * @param player
   * 
   * @throws {RoundStatGetError}
   */
  getPlayerRoundData(player: PlayerMp): SHARED.TYPES.PlayerRoundStatDTO {
    const dto = this.state.players.find(ppl => ppl.id === player.id)

    if (!dto) throw new RoundStatGetError(SHARED.MSG.ERR_WRONG_PLAYER_ID, player)

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

    if (!validator(data)) return false

    this.state.players[stateIndex][key] = data

    if (['shotsFired', 'shotsHit'].indexOf(key) !== -1) {
      this.state.players[stateIndex]["accuracy"] = RoundStat.calculateAccuracy(this.state.players[stateIndex])
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

    if (!validator(data)) return false

    const updateOperation = RoundStat.getOperation(key)
    this.state.players[stateIndex][key] = updateOperation(this.state.players[stateIndex][key], data)
    
    if (['shotsFired', 'shotsHit'].indexOf(key) !== -1) {
      this.state.players[stateIndex]["accuracy"] = RoundStat.calculateAccuracy(this.state.players[stateIndex])
    }

    return true
  }

  /**
   * Set team winners
   * @param {SHARED.TEAMS | false} winner 
   */
  setWinners(winner: SHARED.TEAMS | false): boolean {
    this.state.players.forEach((playerDto, index) => {
      const player = mp.players.at(playerDto.id)

      if (player) {
        if (winner === false) {
          playerDto.draw = true
        } else {
          playerDto.win = playerDto.teamId === winner
        }
        this.state.players[index] = playerDto
      }
    })

    return true
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
    const stateIndex = this.state.players.findIndex(ppl => ppl.id === player.id)

    if (stateIndex === -1) throw new RoundStatUpdateError(SHARED.MSG.ERR_WRONG_PLAYER_ID, player)

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
    const dto: SHARED.TYPES.RoundStatDTO = {
      timestamp: startDate || Date.now(),
      players: players.map(player => {
        const dto   = RoundStat.getDefault()
        dto.id      = player.id
        dto.rgscId  = player.rgscId
        dto.teamId  = player.sharedData.teamId

        return dto
      })
    }

    return DomainConverter.fromDto(RoundStat, dto)
  }

  /**
   * Get default player round stats DTO 
   */
  static getDefault(): SHARED.TYPES.PlayerRoundStatDTO {
    return {
      id                : 0,
      rgscId            : "",
      win               : false,
      kill              : 0,
      death             : 0,
      assist            : 0,
      damage            : {},
      damageReceived    : {},
      shotsFired        : 0,
      shotsHit          : 0,
      accuracy          : 0,
      teamId            : SHARED.TEAMS.ATTACKERS,
      draw              : false,
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