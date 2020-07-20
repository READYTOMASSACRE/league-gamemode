/**
 * Dummy wrapper class
 */
class Dummy<T extends keyof SHARED.TYPES.DummyTypes> {
  readonly dummy: DummyEntityMp
  readonly type: T

  public data: SHARED.TYPES.DummyTypes[T]
  private keys: string[]

  constructor(type: T, data: SHARED.TYPES.DummyTypes[T], dimension: number = 0) {
      this.type = type
      this.dummy = mp.dummies.new(type, data)
      this.keys = Object.keys(data)

      this.data = new Proxy({} as SHARED.TYPES.DummyTypes[T], {
        get: (_, key) => {
          const value = this.dummy.getVariable(key.toString())
          return value !== null ? value : undefined
        },
        set: (_, key: string, value: any) => {
          this.dummy.setVariable(key.toString(), value)
          return true
        },
        ownKeys: () => this.keys,
        getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
      })

      this.update(data)
  }

  /**
   * Update all data in the dummy
   * @param {SHARED.TYPES.DummyTypes[T]} data - data which should be updated in the dummy
   */
  update(data: SHARED.TYPES.DummyTypes[T]): void {
    for (let key in data) this.data[key] = data[key]
  }

  /**
   * Get all data in the dummy
   */
  getData(): SHARED.TYPES.DummyTypes[T] {
    let data: any = {}
    for (let key in this.data) data[key] = this.data[key]

    return data
  }
}

export { Dummy }