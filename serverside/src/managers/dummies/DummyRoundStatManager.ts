import { IsNotExistsError, InvalidTypeError } from "../../errors/LogErrors"
import { Dummy } from "../../entities/Dummy"
import { singleton } from "tsyringe"

/**
 * Class to manage round stats through the dummy
 */
@singleton()
class DummyRoundStatManager implements INTERFACES.Manager {
  private _dummy?: Dummy<SHARED.ENTITIES.ROUND_STAT>

  /**
   * Load dummy
   */
  load(): void {
    const roundStatDTO: SHARED.TYPES.RoundStatDummyDTO = {
      ATTACKERS: {
        score: 0
      },
      DEFENDERS: {
        score: 0
      }
    }

    this._dummy = new Dummy(SHARED.ENTITIES.ROUND_STAT, roundStatDTO)

    this.update(this.toDto())
  }

  /**
   * Return roundstat dto
   */
  toDto(): SHARED.TYPES.RoundStatDummyDTO {
    return this.dummy.getData()
  }

  /**
   * Replace round stat by passing a new dto
   * @param {SHARED.TYPES.RoundStatDummyDTO} dto 
   */
  update(dto: SHARED.TYPES.RoundStatDummyDTO): void {
    this.dummy.update(dto)
  }

  /**
   * Set the team winner by team id
   * @param { SHARED.TEAMS | false} teamId 
   */
  setWinner(teamId: SHARED.TEAMS | false): void {
    if (teamId === false) return

    if (teamId === SHARED.TEAMS.SPECTATORS) {
      throw new InvalidTypeError("Wrong team id")
    }

    const dto = this.toDto()

    dto[teamId].score++

    this.update(dto)
  }

  get dummy() {
    if (!this._dummy) throw new IsNotExistsError("Dummy not found")

    return this._dummy
  }
}

export { DummyRoundStatManager }