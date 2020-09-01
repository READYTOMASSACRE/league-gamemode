import { Validator } from './Validator'

type PlayerEditableData = Pick<PlayerMp, 'model' | 'position' | 'dimension' | 'health'>

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
    dimension: "number",
    health: "number",
  }
}

export { PlayerDataValidator }