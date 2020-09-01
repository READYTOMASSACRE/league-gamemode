import { ErrorHandler } from "../core/ErrorHandler"
import { HUD_COLOR } from "../entities/Route"
import { Vector2 } from "../utils"

export type SpawnVector = {
  [SHARED.TEAMS.ATTACKERS]: Vector3Mp[]
  [SHARED.TEAMS.DEFENDERS]: Vector3Mp[]
}

type SpawnBlips = {
  [SHARED.TEAMS.ATTACKERS]: BlipMp[]
  [SHARED.TEAMS.DEFENDERS]: BlipMp[]
}

const initialState = {
  [SHARED.TEAMS.ATTACKERS]: [],
  [SHARED.TEAMS.DEFENDERS]: []
}

/**
 * Mechanic to draw routes
 */
class DrawRoutes {
  private FOLLOW_PLAYER   : boolean = true
  private DISPLAY_ON_FOOT : boolean = true
  private enabled         : boolean = false
  private path            : SHARED.TYPES.Vector2[] = []
  private blips           : BlipMp[] = []
  private spawn           : SpawnVector = Object.assign({}, initialState)
  private spawnBlips      : SpawnBlips = Object.assign({}, initialState)

  constructor(
    readonly errHandler: ErrorHandler,
    readonly route: INTERFACES.Route,
  ) {
    this.render = this.render.bind(this)
  }

  /**
   * Start draw zones mechanic
   */
  start(): void {
    if (this.enabled) this.stop()

    this.toggle(true)
    this.enabled = true
  }

  /**
   * Stop draw zones mechanic
   */
  stop(): void {
    this.toggle(false)
    this.clear()
    this.enabled = false
  }
  
  /**
   * Add point to path
   */
  addPoint(vector: Vector3Mp): void {
    this.path.push(new Vector2([vector.x, vector.y]))
    this.blips.push(mp.blips.new(1, vector, { color: 75, scale: 1 }))

    this.route.start(HUD_COLOR, this.DISPLAY_ON_FOOT, this.FOLLOW_PLAYER)
  }

  /**
   * Remove point by index from path
   */
  removePoint(index: number): void {
    this.path = this.path.filter((_, vectorIndex) => vectorIndex !== index)
    this.blips = this.blips.filter((blip, vectorIndex) => {
      if (vectorIndex === index && blip.doesExist()) {
        blip.destroy()
      }
      return vectorIndex !== index
    })
    this.route.start(HUD_COLOR, this.DISPLAY_ON_FOOT, this.FOLLOW_PLAYER)
  }

  /**
   * Remove all points
   */
  clear(): void {
    this.clearBlips(this.blips)
    this.clearBlips(this.spawnBlips[SHARED.TEAMS.ATTACKERS])
    this.clearBlips(this.spawnBlips[SHARED.TEAMS.DEFENDERS])

    this.blips = []
    this.path = []

    this.spawn = Object.assign({}, initialState)
    this.spawnBlips = Object.assign({}, initialState)

    this.route.clear()
  }

  /**
   * Clear blips by two dimension array
   * @param {BlipMp[]} blips 
   */
  private clearBlips(blips: BlipMp[]): void {
    blips.forEach(blip => {
      if (mp.blips.exists(blip) && blip.doesExist()) {
         blip.destroy()
      }
    })
  }

  /**
   * @param {SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS} team 
   * @param {Vector3Mp} vector
   * Add a spawn point
   */
  addSpawnPoint(team: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS, vector: Vector3Mp): void {
    this.spawn[team] = [...this.spawn[team], vector]
    const color = team === SHARED.TEAMS.ATTACKERS && 75 || 3
    
    this.spawnBlips[team] = [...this.spawnBlips[team], mp.blips.new(9, vector, { color, scale: 0.1 })]
  }

  /**
   * Remove a spawn point
   * @param {SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS} team 
   * @param {number} index 
   */
  removeSpawnPoint(team: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS, index: number): void {
    this.spawn[team] = this.spawn[team].filter((_, spawnIndex) => spawnIndex !== index)

    this.spawnBlips[team] = this.spawnBlips[team].filter((blip, spawnIndex) => {
      if (spawnIndex === index) {
        this.clearBlips([blip])
      }

      return spawnIndex !== index
    })
  }

  /**
   * Get path polygon
   */
  getPath(): SHARED.TYPES.Vector2[] {
    return this.path
  }

  /**
   * Get spawn vectors
   */
  getSpawn(): SpawnVector {
    return this.spawn
  }

  /**
   * Get enable state
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Toggle state of draw zones
   * @param {boolean} state 
   */
  toggle(state: boolean) {
    this.route.clear()

    if (state === true) {
      this.route.start(HUD_COLOR, this.DISPLAY_ON_FOOT, this.FOLLOW_PLAYER)
      mp.events.add(RageEnums.EventKey.RENDER, this.render)
    } else {
      mp.events.remove(RageEnums.EventKey.RENDER, this.render)
    }
  }

  /**
   * Render method
   */
  private render(): void {
    try {
      this.path.forEach(vector => this.route.addPoint(vector))
      this.route.setRender(true)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
      this.toggle(false)
    }
  }
}

export { DrawRoutes }