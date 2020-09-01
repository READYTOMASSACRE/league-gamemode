import { Validator } from './Validator'

export type Point = {
  name: string
  coord: Vector3Mp
}

export type SpawnVectorState = {
  [SHARED.TEAMS.ATTACKERS]: Point[]
  [SHARED.TEAMS.DEFENDERS]: Point[]
}

export interface MapEditorState {
  path: Point[]
  spawn: SpawnVectorState
  mapName: string
}

/**
 * @inheritdoc
 */
class MapEditorDataValidator extends Validator<MapEditorState> {
  /**
   * @inheritdoc
   */
  protected validators: KeyValueCollection = {
    mapName: "string",
    path: "pointArray",
    spawn: "spawn",
  }
}

export { MapEditorDataValidator }