import { singleton } from "tsyringe"
import { Dummy } from "../../entities/Dummy"
import { getJsonFromFileSync, getProjectDir, getRandomInt } from "../../utils"
import { resolve } from "path"
import { IsNotExistsError } from "../../errors/LogErrors"
import { NotFoundNotifyError } from "../../errors/PlayerErrors"

/**
 * Class to manage server maps through the dummies
 */
@singleton()
class DummyMapManager implements INTERFACES.Manager {
  static readonly MAP_FOLDER: string = resolve(getProjectDir(), 'assets', 'maps.json')

  private _dummies: Dummy<SHARED.ENTITIES.MAP>[] = []

  /**
   * Load all maps from maps.json and storage in the memory
   */
  load() {
    this._dummies = this
      .loadAll()
      .map(map => new Dummy(SHARED.ENTITIES.MAP, map))
  }

  /**
   * Load the current map
   * @param {string} mapIdOrCode 
   * @param {PlayerMp | PlayerMp[]} players - (optional) player or players to pass en error to them
   */
  loadMap(mapIdOrCode: string, players?: PlayerMp | PlayerMp[]): SHARED.TYPES.GameMap {
    const map = this.getMap(mapIdOrCode, players)

    return map.data
  }

  /**
   * Get spawn vectors by map and team ids
   * @param {number} mapId 
   * @param {SHARED.TEAMS} teamId 
   */
  getSpawnVectors(mapId: number, teamId: SHARED.TEAMS): Vector3Mp[] {
    return this
      .getMap(mapId)
      .data
      .spawnPoints[teamId]
      .map(([x, y, z]) => new mp.Vector3(x, y, z))
  }

  /**
   * Find the map by id
   * 
   * @param mapIdOrCode - map id
   * @param players - (optional) players for broadcasting an error
   * 
   * @throws {NotFoundNotifyError}
   * @throws {IsNotExistsError}
   */
  getMap(mapIdOrCode: string | number, players?: PlayerMp | PlayerMp[]): Dummy<SHARED.ENTITIES.MAP> {
    const map = this._dummies.find(dummyMap => dummyMap.data.id === +mapIdOrCode || dummyMap.data.code === mapIdOrCode)

    if (!map) {
      if (players) {
        throw new NotFoundNotifyError(SHARED.MSG.ERR_MAP_NOT_FOUND, players, mapIdOrCode.toString())
      } else {
        throw new IsNotExistsError("Map not found" + mapIdOrCode)
      }
    }

    return map
  }

  /**
   * Getting all maps due to mapIdOrCode
   * @param {string | number} mapIdOrCode 
   */
  getMaps(mapIdOrCode: string | number): Dummy<SHARED.ENTITIES.MAP>[] {
    return this._dummies.filter(dummyMap => (
      dummyMap.data.id === +mapIdOrCode
      || dummyMap.data.code.match(mapIdOrCode.toString())
    ))
  }
  
  /**
   * Get a random spawn vector
   * @param {number} mapId
   * @param {SHARED.TEAMS} teamId the index of team
   */
  getRandomSpawnVector(mapId: number, teamId: SHARED.TEAMS): Vector3Mp {
    const vectors = this.getSpawnVectors(mapId, teamId)
    const vectorIndex = getRandomInt(vectors.length)

    return vectors[vectorIndex]
  }

  /**
   * Load maps.json
   */
  private loadAll(): SHARED.TYPES.GameMap[] {
    return getJsonFromFileSync(DummyMapManager.MAP_FOLDER) as SHARED.TYPES.GameMap[]
  }

  get dummies() {
    if (!this._dummies) {
      throw new IsNotExistsError("Dummy not found")
    }

    return this._dummies
  }
}

export { DummyMapManager }