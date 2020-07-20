export const SHARED_DATA = "sharedData"

/**
 * Helper class to store shared data
 */
class SharedData {
  constructor(handler: ProxyHandler<SharedData>) {
    const proxy = new Proxy(this, handler)

    return proxy
  }
}

/**
 * Makes the proxy to getting data from an entity
 * @param {any} entity 
 */
export const getSharedData = (entity: any): any => {
  return function(target: any, key: any) {
    if (typeof target[key] === 'function') return target[key]

    const sharedData = entity.getVariable(SHARED_DATA)

    return sharedData ? sharedData[key] : undefined
  }
}

/**
 * Makes the proxy to setting data to an entity
 * @param {any} entity 
 */
export const setSharedData = (entity: any) => {
  return function(target: any, key: string | number | symbol, value: any): boolean {
    if (typeof target[key] === 'function') return true

    const sharedData = entity.getVariable(SHARED_DATA)
    entity.setVariable(SHARED_DATA, { ...sharedData, [key]: value })

    return true
  }
}

export { SharedData }