type Result<T> = T
type Operation<T> = (accumulator: any, value: any) => Result<T> 
type Value<T extends Operation<any>> = ReturnType<T>

/**
 * Operation factory configure
 * @param operations 
 */
const configure = <O extends Record<keyof O, Operation<any>>>(operations: O) => {
  return <K extends keyof O>(key: K) => {
    return (accumulator: any, value: any): Value<O[K]> => {
      const operation = operations[key]
      return operation(accumulator, value)
    }
  }
}

const add               = (data: number, additional: number) => data + additional
const subtract          = (data: number, additional: number) => data - additional
const replace           = (_: any, value: any) => value
const addObject         = (data: any,    additional: any) => {
  Object.keys(additional).forEach(key => {
    if (typeof data[key] === 'undefined') data[key] = 0
    data[key] = add(data[key], additional[key])
  })

  return data
}
const subtractObject    = (data: any, additional: any) => {
  Object.keys(additional).forEach(key => {
    if (typeof data[key] === 'undefined') data[key] = 0
    data[key] = subtract(data[key], additional[key])
  })

  return data
}

/**
 * Operation factory
 */
export const operationFactory = configure({
  add,
  subtract,
  addObject,
  subtractObject,
  replace,
})
