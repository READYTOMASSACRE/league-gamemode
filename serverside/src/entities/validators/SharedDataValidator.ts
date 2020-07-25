import { Validator } from './Validator'

/**
 * @inheritdoc
 */
class SharedDataValidator extends Validator<Partial<SHARED.TYPES.SharedData>> {
  /**
   * @inheritdoc
   */
  protected validators: KeyValueCollection = {
    lang: "string",
    state: "number",
    teamId: "string",
  }
}

export { SharedDataValidator }