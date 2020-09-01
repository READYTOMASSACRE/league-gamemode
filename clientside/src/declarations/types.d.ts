declare namespace TYPES {
  type GameMap = Pick<SHARED.TYPES.GameMap, 'id' | 'code'> & {
    area: SHARED.TYPES.Vector2[]
    spawnPoints: { [key in SHARED.TEAMS]: Vector3Mp[] }
  }

  type PlayerTeam = {
    ID: SHARED.TEAMS
    NAME: string
    SKINS: string[]
    COLOR: string
  }

  type PlayerCustomData = {
    rollbackVector?: SHARED.TYPES.Vector2
    rollbackPosition?: Vector3Mp
    isSelecting: boolean
    isSpectating: boolean
    assist: { [key: number]: number }
  }

  type KeyNumberCollection = { [key: string]: number }
}