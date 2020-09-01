import { singleton } from "tsyringe"
import { Dummy } from "../../entities/Dummy"
import { getJsonFromFileSync, getProjectDir, getRandomInt, putJsonToFileSync } from "../../utils"
import { resolve } from "path"
import { IsNotExistsError } from "../../errors/LogErrors"
import { NotFoundNotifyError, InvalidArgumentNotify } from "../../errors/PlayerErrors"
import { MapEditorState, MapEditorDataValidator, Point, SpawnVectorState } from "../../entities/validators/MapEditorDataValidator"

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
   * Destroy all current dummies
   */
  destroy(): void {
    this._dummies.forEach(dummy => dummy.dummy.destroy())
  }

  /**
   * Refresh map object
   */
  refreshDummies(): void {
    this.destroy()
    this.load()

    mp.players.call(SHARED.EVENTS.SERVER_REFRESH_DUMMY, [SHARED.ENTITIES.MAP])
  }

  /**
   * Add a new map to json file
   * @param {MapEditorState} dto 
   * @param {PlayerMp} notifiedPlayer (optional)
   */
  addMap(dto: MapEditorState, notifiedPlayer?: PlayerMp): SHARED.TYPES.GameMap {
    dto = this.formatDto(dto)
    const validator = new MapEditorDataValidator(dto)

    if (validator.isValid()) {
      const { spawn, path, mapName } = dto

      if (this.hasName(mapName)) {
        throw new InvalidArgumentNotify(SHARED.MSG.ERR_MAP_ALREADY_EXISTS, notifiedPlayer, mapName)
      }

      if (
        !path.length
        || !spawn[SHARED.TEAMS.ATTACKERS].length
        || !spawn[SHARED.TEAMS.DEFENDERS].length
      ) {
        let emptyArray = !path.length && 'Map position' || ''
        emptyArray += !spawn[SHARED.TEAMS.ATTACKERS].length && ' Attackers spawn' || ''
        emptyArray += !spawn[SHARED.TEAMS.DEFENDERS].length && ' Defenders spawn' || ''

        throw new InvalidArgumentNotify(SHARED.MSG.ERR_INVALID_EMPTY_ARRAY, notifiedPlayer, emptyArray)
      }
      
      const newMap = this.create(dto)
      this.saveAll([...this.loadAll(), newMap])

      return newMap
    } else {
      throw new InvalidArgumentNotify(SHARED.MSG.ERR_INVALID_VALIDATOR, notifiedPlayer)
    }
  }

  /**
   * Format dto before validate
   * @param {MapEditorState} dto
   */
  private formatDto(dto: MapEditorState): MapEditorState {
    dto.path = dto.path.map(({ name, coord }) => ({ name, coord: new mp.Vector3(coord.x, coord.y, coord.z) }))

    dto.spawn = {
      [SHARED.TEAMS.ATTACKERS]: dto.spawn[SHARED.TEAMS.ATTACKERS].map(({ name, coord }) => ({ name, coord: new mp.Vector3(coord.x, coord.y, coord.z) })),
      [SHARED.TEAMS.DEFENDERS]: dto.spawn[SHARED.TEAMS.DEFENDERS].map(({ name, coord }) => ({ name, coord: new mp.Vector3(coord.x, coord.y, coord.z) })),
    }

    return dto
  }

  /**
   * Make a new map object
   * @param {MapEditorState} dto 
   */
  private create(dto: MapEditorState) : SHARED.TYPES.GameMap {
    return {
      id            : this.getId(),
      code          : dto.mapName,
      area          : this.formatArea(dto.path),
      spawnPoints   : this.formatSpawnPoints(dto.spawn)
    }
  }

  /**
   * Format area position from dto
   * @param {Point[]} points 
   */
  private formatArea(points: Point[]): [number,number][] {
    return points.map(point => [+point.coord.x.toFixed(4), +point.coord.y.toFixed(4)])
  }

  /**
   * Format spawn position from dto
   * @param {Point[]} points 
   */
  private formatSpawnPoint(points: Point[]): [number, number, number][] {
    return points.map(point => [+point.coord.x.toFixed(4), +point.coord.y.toFixed(4), +point.coord.z.toFixed(4)])
  }

  /**
   * Format spawn point vectors
   * @param {SpawnVectorState} spawnVector 
   */
  private formatSpawnPoints(spawnVector: SpawnVectorState): { [key in SHARED.TEAMS]: [number, number, number][] } {
    return {
      [SHARED.TEAMS.ATTACKERS]    : this.formatSpawnPoint(spawnVector.ATTACKERS),
      [SHARED.TEAMS.DEFENDERS]    : this.formatSpawnPoint(spawnVector.DEFENDERS),
      [SHARED.TEAMS.SPECTATORS]   : this.formatSpawnPoint(spawnVector.ATTACKERS),
    }
  }

  /**
   * Get new id of map
   */
  private getId(accumulator: number = 1): number {
    const dummy = this._dummies[this._dummies.length - 1]
    if (typeof dummy === 'undefined') return 0


    const newId = dummy.data.id + accumulator

    if (this.hasId(newId)) return this.getId(accumulator + 1)

    return newId
  }

  /**
   * Check if map exists by name
   * @param {string} name 
   */
  private hasName(name: string): boolean {
    return !!this._dummies.find(dummy => dummy.data.code === name)
  }

  /**
   * Check if map exists by id
   * @param {number} id 
   */
  private hasId(id: number): boolean {
    return !!this._dummies.find(dummy => dummy.data.id === id)
  }

  /**
   * Load maps.json
   */
  private loadAll(): SHARED.TYPES.GameMap[] {
    return getJsonFromFileSync(DummyMapManager.MAP_FOLDER) as SHARED.TYPES.GameMap[]
  }

  /**
   * Save maps.json
   * @param {SHARED.TYPES.GameMap[]} maps 
   */
  private saveAll(maps: SHARED.TYPES.GameMap[]) {
    return putJsonToFileSync(DummyMapManager.MAP_FOLDER, JSON.stringify(maps))
  }

  get dummies() {
    if (!this._dummies) {
      throw new IsNotExistsError("Dummy not found")
    }

    return this._dummies
  }
}

export { DummyMapManager }