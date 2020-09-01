import { singleton, autoInjectable } from "tsyringe"
import { Dummy } from "../../entities/Dummy"
import { Vector2 } from "../../utils"
import { NotFoundNotifyError } from "../../errors/PlayerErrors"
import { DummyLanguageManager } from "./DummyLanguageManager"
import { event, eventable } from "rage-decorators"
import { ErrorHandler } from "../../core/ErrorHandler"

export type MapInfo = Pick<TYPES.GameMap, 'id' | 'code'>

/**
 * Class to manage maps through the dummies
 */
@singleton()
@eventable()
@autoInjectable()
class DummyMapManager {
  private readonly type = SHARED.ENTITIES.MAP
  private dummies: Dummy<SHARED.ENTITIES.MAP>[] = []

  constructor(
    readonly lang: DummyLanguageManager,
    readonly errHandler: ErrorHandler,
  ) {
    this.cefVoteRequest = this.cefVoteRequest.bind(this)
    this.refreshDummies = this.refreshDummies.bind(this)
  }

  /**
   * Event
   * 
   * Fires from the serverside to update dummies
   * @param {SHARED.ENTITIES} type 
   */
  @event(SHARED.EVENTS.SERVER_REFRESH_DUMMY)
  refreshDummies(type: SHARED.ENTITIES): void {
    try {
      if (type !== SHARED.ENTITIES.MAP) return
  
      this.dummies = []
      this.registerDummies()
    } catch (err) {
      if (this.errHandler.handle(err)) throw err
    }
  }

  /**
   * RPC Call
   * 
   * Format maps for CEF request
   */
  cefVoteRequest(): { maps: MapInfo[]} {
    const maps: MapInfo[] = []
    this.dummies.forEach(dummy => {
      maps.push({
        id: dummy.data.id,
        code: dummy.data.code,
      })
    })

    return { maps }
  }

  /**
   * Register all existing dummies
   */
  registerDummies(): void {
    mp.dummies.forEachByType(this.type, entity =>
      this.dummies.push(new Dummy(this.type, entity))
    )
  }

  /**
   * Load existing map from the server
   * @param { number | string} mapIdOrCode 
   */
  loadMap(mapIdOrCode: number | string): TYPES.GameMap {
    const map = this.dummies.find(dummyMap => dummyMap.data.id === +mapIdOrCode || dummyMap.data.code === mapIdOrCode)

    if (!map) {
      throw new NotFoundNotifyError(this.lang.get(SHARED.MSG.ERR_MAP_NOT_FOUND))
    }

    return this.normalize(map)
  }

  /**
   * Normalize data from the server to playable
   * @param {Dummy<SHARED.ENTITIES.MAP>} map 
   */
  private normalize(map: Dummy<SHARED.ENTITIES.MAP>): TYPES.GameMap {
    const { id, code, area, spawnPoints } = map.data
    return {
      id,
      code,
      area: area.map(point => new Vector2(point)),
      spawnPoints: {
        ATTACKERS: spawnPoints.ATTACKERS.map(([x, y, z]) => new mp.Vector3(x, y, z)),
        DEFENDERS: spawnPoints.DEFENDERS.map(([x, y, z]) => new mp.Vector3(x, y, z)),
        SPECTATORS: spawnPoints.SPECTATORS
          && spawnPoints.SPECTATORS.map(([x, y, z]) => new mp.Vector3(x, y, z))
          || spawnPoints.ATTACKERS.map(([x, y, z]) => new mp.Vector3(x, y, z)),
      }
    }
  }
}

export { DummyMapManager }