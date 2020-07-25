import { validatorFactory } from '../../validators/validatorFactory'
import { InvalidArgument } from '../../errors/LogErrors'
import { keys } from '../../utils'
import { DEBUG } from '../../bootstrap'

/**
 * Class to validate a data which passed in the player
 */
class Validator<T> {
  /**
   * Key value collection to flag a validator function from the factory
   */
  protected validators: KeyValueCollection = {}
  /**
   * Storage the validated values
   */
  protected _validated: Partial<T> = {}
  
  constructor(private readonly dto: T) {}

  /**
   * Validate all values which passed into the class
   */
  isValid(): boolean {
    keys(this.dto)
      .filter(key => {
        // get a validator name
        const validatorName = this.validators[key as string]

        if (typeof validatorName === 'undefined') {
          throw new InvalidArgument(`Key validator ${key} doesn't exists in ${keys(this.validators).join(', ')}`)
        }

        // make an validator function
        const validator = validatorFactory(validatorName)

        if (typeof validator !== 'function') {
          throw new InvalidArgument(`Validator ${validatorName} is not a function`)
        }

        // grab the a data by key
        const value = this.dto[key]

        // check if the data is correct
        const isValidValue = (typeof value !== 'undefined') && validatorFactory(validatorName)(value)

        // print to console if data is invalid and we're in debug mode
        if (DEBUG && !isValidValue) {
          console.debug(this.constructor.name, 'INVALID_DATA', key, value, validatorName)
        }

        return isValidValue
      })
      .forEach(key => this.validated[key] = this.dto[key])

    return !!keys(this.validated).length
  }

  /**
   * Return the validated state
   */
  get validated(): Partial<T> {
    return this._validated
  }
}

export { Validator }