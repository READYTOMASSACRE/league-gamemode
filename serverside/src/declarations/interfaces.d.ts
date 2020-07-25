declare namespace INTERFACES {
  /**
   * Manager interface
   */
  interface Manager {
    /**
     * Load manager into application
     * @param {any} params (optional)
     */
    load(params?: any): void
  }

  /**
   * Interface of the entity
   */
  interface EntityManager<E extends EntityMp> {
    initData(entity: E): void

    getTeam(entity: E): SHARED.TEAMS
    setTeam(entity: E, teamId: SHARED.TEAMS): boolean

    spawn(entity: E, vector: Vector3Mp): boolean

    getState(entity: E): SHARED.STATE
    setState(entity: E, state: SHARED.STATE): boolean
    hasState(entity: E, state: SHARED.STATE | SHARED.STATE[]): boolean

    getEntitiesWithState(state: SHARED.STATE | SHARED.STATE[], players?: E[]) : E[]

    call(entity: E, eventName: string, args: any[]): void
  }

  /**
   * DTO validator interface
   */
  interface DtoValidator {
    valid(value: any): boolean
    getValue(value: any): any
  }
}