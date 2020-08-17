import { Validator } from './Validator'

type PlayerEditableData = Pick<PlayerMp, 'model' | 'position'>

/**
 * @inheritdoc
 */
class PlayerDataValidator extends Validator<PlayerEditableData> {
  /**
   * @inheritdoc
   */
  protected validators: KeyValueCollection = {
    model: "number",
    position: "vector",
    health: "number",
  }
}

export { PlayerDataValidator }