import { SharedData, getSharedData, setSharedData } from "./SharedData"

/**
 * Base entity class
 */
abstract class EntityBase<E extends EntityMp> implements INTERFACES.EntityManager<E> {
  constructor() {
    this.initData = this.initData.bind(this)
    this.list = this.list.bind(this)
  }

  /**
   * Init shared data
   * @param {E} entity - entity which should init shared data
   */
  initData(entity: E): void {
    if (!entity.sharedData) {
      entity.sharedData = new SharedData({ get: getSharedData(entity), set: setSharedData(entity) }) as SHARED.TYPES.SharedData
    }
  }

  /**
   * Get entity team
   * @param {E} entity 
   */
  getTeam(entity: E): SHARED.TEAMS {
    return entity.sharedData.teamId
  }

  /**
   * Set entity team
   * @param {E} entity 
   * @param {SHARED.TEAMS} teamId 
   */
  setTeam(entity: E, teamId: SHARED.TEAMS): boolean {
    entity.sharedData.teamId = teamId

    return true
  }

  /**
   * Spawn the entity
   * @param {E} entity 
   * @param {Vector3Mp} spawnVector 
   */
  spawn(entity: E, spawnVector: Vector3Mp): boolean {
    entity.position = spawnVector

    return true
  }

  /**
   * Set the state of an entity
   * @param {E} entity 
   * @param {SHARED.STATE} state 
   */
  setState(entity: E, state: SHARED.STATE): boolean {
    entity.sharedData.state = state

    return true
  }

  /**
   * Get the current state of an entity
   * @param {E} entity 
   */
  getState(entity: E): SHARED.STATE {
    return entity.sharedData.state
  }

  /**
   * Does an entity have the passed state/states
   * @param {E} entity 
   * @param {SHARED.STATE | SHARED.STATE[]} state 
   */
  hasState(entity: E, state: SHARED.STATE | SHARED.STATE[]): boolean {
    if (typeof entity === 'undefined') return false

    state = Array.isArray(state) && state || [state]

    return state.indexOf(entity.sharedData.state) !== -1
  }

  /**
   * Get all entities which have the passed state/states
   * @param {SHARED.STATE | SHARED.STATE[]} state 
   * @param {E} entities (optional)
   */
  getEntitiesWithState(state: SHARED.STATE | SHARED.STATE[], entities?: E[]) : E[] {
    return (entities || this.toArray())
      .filter(entity => Array.isArray(state)
        ? state.includes(this.getState(entity))
        : this.getState(entity) === state
      )
  }

  /**
   * Get the list of entities
   * @param {SHARED.STATE} state (optional)
   */
  list(state?: SHARED.STATE): E[] {
    return state
      ? this.getEntitiesWithState(state)
      : this.toArray()
  }

  call(entity: E, eventName: string, args: any[]): void {}

  /**
   * Return the array of entities
   */
  abstract toArray(): E[]
}

export { EntityBase }