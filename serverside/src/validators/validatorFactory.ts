type Success<T> = [true, T]
type Failure = [false, any]
type Result<T> = Success<T> | Failure
type Validator<T> = (x: any) => Result<T> 
type Value<T extends Validator<any>> = Extract<ReturnType<T>, [true, any]>[1]

/**
 * Validators factory configure
 * @param validators
 */
const configure = <V extends Record<keyof V, Validator<any>>>(validators: V) => {
  return <K extends keyof V>(key: K) => {
    return (x: any): x is Value<V[K]> => {
      const validator = validators[key]
      const [valid] = validator(x)
      return valid
    }
  }
}

const isArray3d = (x: Array3d) => x.filter(vec => typeof vec === 'number').length === 3
const isVector = (x: any) =>
  typeof x.x  === 'number'
  && typeof x.y === 'number'
  && typeof x.z === 'number'
  && x.toArray === 'function'
  && isArray3d(x.toArray())
const isNumberObject = (x: any) => Object.values(x).filter(value => typeof value === 'number').length === Object.values(x).length

/**
 * Validators factory
 */
export const validatorFactory = configure({
  number: (x: any) => typeof x === 'number' ? [true, x] : [false, 'Invalid!'],
  string: (x: any) => typeof x === 'string' ? [true, x]: [false, 'Invalid'],
  vector: (x: any) => isVector(x) ? [true, x]: [false, 'Invalid!'],
  array3d: (x: Array3d) => isArray3d(x) ? [true, x] : [false, 'Invalid!'],
  numberObject: (x: any) => isNumberObject(x) ? [true, x] : [false, 'Invalid!'],
})