/**
 * Dummy entity which synchronized with server-side
 */
class Dummy<T extends keyof SHARED.TYPES.DummyTypes> {
  readonly dummy: DummyEntity
  readonly type: T

  public data: SHARED.TYPES.DummyTypes[T]

  constructor(type: T, dummyEntity: DummyEntity) {
      this.type = type
      this.dummy = dummyEntity

      this.data = new Proxy({} as SHARED.TYPES.DummyTypes[T], {
        get: (_, key) => this.dummy.getVariable(key.toString())
      })
  }
}

export { Dummy }