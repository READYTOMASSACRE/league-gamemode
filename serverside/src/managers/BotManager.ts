import { singleton, injectable } from "tsyringe"
import { DummyConfigManager } from "./dummies/DummyConfigManager"
import { EntityBase } from "../entities/EntityBase"

interface IPedArguments {
  modelHash: number
  position: Vector3Mp
  teamId?: SHARED.TEAMS
}

/**
 * @todo will be commented
 * At this moment this class has no effects
 */
@injectable()
@singleton()
class BotManager extends EntityBase<PedMp> {
  static readonly watchTimeout = 100

  private readonly collection: Map<number, PedMp> = new Map()
  private watchInterval?: NodeJS.Timeout

  constructor(readonly dummyConfigManager: DummyConfigManager) {
    super()
  }

  get(id: number): PedMp | undefined {
    return this.collection.get(id)
  }

  addBot(teamId: SHARED.TEAMS): PedMp {
    return this.add({
      modelHash: mp.joaat(this.dummyConfigManager.getRandomSkin(teamId)),
      position: new mp.Vector3(0, 0, 0),
      teamId,
    })
  }

  removeBot(botId: number): boolean {
    return this.remove(botId)
  }

  getBot(botId: number) {
    return this.collection.get(botId)
  }

  toArray(): PedMp[] {
    const peds: PedMp[] = []
    this.collection.forEach(ped => peds.push(ped))

    return peds
  }

  private add(params: IPedArguments): PedMp {
    const { modelHash, position, teamId = SHARED.TEAMS.ATTACKERS } = params
    const ped = mp.peds.new(modelHash, position)

    this.initData(ped)
    ped.sharedData.teamId = teamId
    this.collection.set(ped.id, ped)

    return ped
  }

  private remove(botId: number): boolean {
    const ped = this.collection.get(botId)
    
    if (!ped) return false

    ped.destroy()
    this.collection.delete(ped.id)

    return true
  }
}

export { BotManager }