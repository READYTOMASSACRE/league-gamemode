import { singleton, injectable } from "tsyringe";
import { Dummy } from "../../entities/Dummy";
import { Vector2, logbrowser } from "../../utils";
import { Language } from "../../core/Language";
import { NotFoundNotifyError } from "../../errors/PlayerErrors";

/**
 * Class to manage maps through the dummies
 */
@singleton()
@injectable()
class DummyMapManager {
  private readonly type = SHARED.ENTITIES.MAP
  private readonly dummies: Dummy<SHARED.ENTITIES.MAP>[] = []

  constructor(readonly lang: Language) {}
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

    logbrowser(this.dummies, map)

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