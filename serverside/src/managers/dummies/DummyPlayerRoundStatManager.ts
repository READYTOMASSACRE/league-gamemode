import { Dummy } from "../../entities/Dummy"
import { singleton, autoInjectable } from "tsyringe"
import { eventable, event } from "rage-decorators"
import { RoundStat } from "../../db/domains/RoundStat"
import { IsNotExistsError } from "../../errors/LogErrors"

/**
 * Class to manage player round stats through the dummies
 */
@singleton()
@eventable()
@autoInjectable()
class DummyPlayerRoundStatManager {
  private dummies: Map<number, Dummy<SHARED.ENTITIES.PLAYER_STAT>> = new Map()

  constructor() {
    this.playerQuit = this.playerQuit.bind(this)
  }

  /**
   * Make the new PlayerRoundStatDTO for a player when them ready
   * @note possible can invokes from PlayerManager when the player is ready
   * 
   * @param {PlayerMp}player 
   */
  playerReady(player: PlayerMp) {
    if (!this.dummies.get(player.id)) {
      const dto   = RoundStat.getDefault()
      dto.id      = player.id
      dto.rgscId  = player.rgscId

      const dummy = new Dummy(SHARED.ENTITIES.PLAYER_STAT, dto)

      this.dummies.set(dto.id, dummy)
    }
  }

  /**
   * Fires when the player has left
   * @param {PlayerMp} player 
   */
  @event(RageEnums.EventKey.PLAYER_QUIT)
  playerQuit(player: PlayerMp) {
    const dummyInstance = this.get(player.id)

    dummyInstance.dummy.destroy()
    this.dummies.delete(player.id)
  }

  /**
   * Return PlayerRoundStatDTO by player.id
   * @param {number} id 
   */
  toDto(id: number): SHARED.TYPES.PlayerRoundStatDTO {
    return this.get(id).getData()
  }

  /**
   * Get the dummy of an player round stats by player id
   * @param {number} id 
   */
  get(id: number): Dummy<SHARED.ENTITIES.PLAYER_STAT> {
    const dummyInstance = this.dummies.get(id)

    if (!dummyInstance) {
      throw new IsNotExistsError("Wrong player id " + id)
    }

    return dummyInstance
  }

  /**
   * Update player round stats in the dummy
   * @param {Partial<SHARED.TYPES.PlayerRoundStatDTO>} dto 
   */
  update(dto: Partial<SHARED.TYPES.PlayerRoundStatDTO>): void {
    if (typeof dto.id === 'undefined') {
      throw new IsNotExistsError("Invalid dto id")
    }
    const dummyInstance = this.get(dto.id)
    const newDto = RoundStat.mergePlayer(dummyInstance.getData(), dto)

    dummyInstance.update(newDto)
  }

  /**
   * Destroy the dummy of an player
   * @param {PlayerMp} player 
   */
  destroy(player: PlayerMp): void {
    const dummyInstance = this.get(player.id)

    dummyInstance.dummy.destroy()
    this.dummies.delete(player.id)
  }

  /**
   * Destroy all dummies
   */
  destroyAll(): void {
    this.dummies.forEach(dummyInstance => {
      dummyInstance.dummy.destroy()
      this.dummies.delete(dummyInstance.data.id)
    })
  }
}

export { DummyPlayerRoundStatManager }