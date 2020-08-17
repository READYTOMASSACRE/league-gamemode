import { Entity, PrimaryColumn, Column, ObjectIdColumn, ObjectID } from "typeorm"
import { DomainConverter } from "./DomainConverter"
import { validatorFactory } from "../../validators/validatorFactory"
import { operationFactory } from "../../validators/operationFactory"
import { logMethod } from "../../utils"
import { DEBUG } from "../../bootstrap"
import { RoundStatGetError, RoundStatUpdateError, NotFoundNotifyError } from "../../errors/PlayerErrors"
import { IsNotExistsError, InvalidTypeError } from "../../errors/LogErrors"

type RoundIgnoredKeys = 'id' | 'rgscId' | 'win' | 'draw' | 'accuracy' | 'name'
type RoundStatEditableKeys = Exclude<keyof SHARED.TYPES.PlayerRoundStatDTO, RoundIgnoredKeys>
export type RoundKeyValueCollection = { [key in RoundStatEditableKeys]: string }

@Entity()
export class Round {
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

  @ObjectIdColumn()
  public id!: ObjectID

  @Column()
  public created_at!: number

  @Column()
  public state!: SHARED.TYPES.RoundStatDTO

  constructor(state: SHARED.TYPES.RoundStatDTO) {
    if (state) {
      this.created_at   = state.created_at
      this.state        = state
    }
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
    const validator = Round.getValidator(key)

    const teamId = player.sharedData.teamId

    if (teamId === SHARED.TEAMS.SPECTATORS) {
      throw new RoundStatGetError(SHARED.MSG.ERR_WRONG_PLAYER_ID, player)
    }

    if (!validator(data)) return false

    this.state[teamId][stateIndex][key] = data

    if (['shotsFired', 'shotsHit'].indexOf(key) !== -1) {
      this.state[teamId][stateIndex]["accuracy"] = Round.calculateAccuracy(this.state[teamId][stateIndex])
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
    const validator = Round.getValidator(key)

    const teamId = player.sharedData.teamId

    if (teamId === SHARED.TEAMS.SPECTATORS) {
      throw new RoundStatGetError(SHARED.MSG.ERR_WRONG_PLAYER_ID, player)
    }

    if (!validator(data)) return false

    const updateOperation = Round.getOperation(key)
    this.state[teamId][stateIndex][key] = updateOperation(this.state[teamId][stateIndex][key], data)
    
    if (['shotsFired', 'shotsHit'].indexOf(key) !== -1) {
      this.state[teamId][stateIndex]["accuracy"] = Round.calculateAccuracy(this.state[teamId][stateIndex])
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
   * Update player's team
   * @param {PlayerMp} player
   */
  updatePlayerTeam(player: PlayerMp): void {
    try {
      const playerTeamId    = player.sharedData.teamId
      const [teamId, index] = this.getPlayerTeam(player)

      if (
        playerTeamId !== teamId
        && playerTeamId !== SHARED.TEAMS.SPECTATORS
      ) {
        this.swapTeamByIndex(teamId, playerTeamId, index)
      }
    } catch (err) {
      if (err instanceof NotFoundNotifyError) {
        const teamId    = player.sharedData.teamId

        if (teamId !== SHARED.TEAMS.SPECTATORS) {
          const dto       = Round.getDefault()
  
          dto.name        = player.name
          dto.id          = player.id
          dto.rgscId      = player.rgscId
  
          this.state[teamId].push(dto)
        }
      } else {
        throw err
      }
    }
  }

  /**
   * Swap player's team
   * @param {SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS} from 
   * @param {SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS} to 
   * @param {number} index 
   */
  swapTeamByIndex(from: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS, to: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS, index: number): void {
    if (index > -1) {
      const playerStats = this.state[from].splice(index, 1)
      this.state[to].push(...playerStats)
    }
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
    if (!Round.validators[key]) {
      throw new IsNotExistsError("Invalid key " + key)
    }

    const validator = validatorFactory(Round.validators[key] as any)

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
    if (!Round.operations[key]) {
      throw new IsNotExistsError("Invalid key " + key)
    }

    const operation = operationFactory(Round.operations[key] as any)

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
  static create(startDate?: number, players: PlayerMp[] = []): Round {
    const [attackers, defenders] = Round.preparePlayers(players)

    const dto: SHARED.TYPES.RoundStatDTO = {
      created_at: startDate || Date.now(),
      winner: false,
      ATTACKERS: attackers,
      DEFENDERS: defenders,
    }

    return DomainConverter.fromDto(Round, dto)
  }

  /**
   * Prepare players dto objects
   * @param {PlayerMp[]} players 
   */
  static preparePlayers(players: PlayerMp[]): [SHARED.TYPES.PlayerRoundStatDTO[], SHARED.TYPES.PlayerRoundStatDTO[]] {
    const attackers = players
      .filter(player => player.sharedData.teamId === SHARED.TEAMS.ATTACKERS)
      .map(player => {
        const dto   = Round.getDefault()

        dto.name    = player.name
        dto.id      = player.id
        dto.rgscId  = player.rgscId

        return dto
      })

    const defenders = players
      .filter(player => player.sharedData.teamId === SHARED.TEAMS.DEFENDERS)
      .map(player => {
        const dto   = Round.getDefault()

        dto.name    = player.name
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
      name              : "",
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
        if (typeof dtoValue !== 'undefined' && Round.validators[dtoKey] && Round.operations[dtoKey]) {
          const validator = Round.getValidator(dtoKey)
          if (validator(dtoValue)) {
            const operation = Round.getOperation(dtoKey)
            accumulator = {...accumulator, ...{ [dtoKey]: operation(accumulatorValue, dtoValue) } }
          }
        }
      })

    accumulator["accuracy"] = Round.calculateAccuracy(accumulator)

    return accumulator
  }
}