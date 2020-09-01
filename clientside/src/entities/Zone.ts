/**
 * Class to control of zone
 */
export class Zone {
  constructor(public map: TYPES.GameMap) {}

  /**
   * Check if vector in zone
   * @param {SHARED.TYPES.Vector2} vector 
   */
  in(vector: SHARED.TYPES.Vector2): boolean {
    let deltaIndex: number = this.map.area.length - 1

    let inPolygon: boolean = false
    this.map.area.forEach((currVector: SHARED.TYPES.Vector2, index: number) => {
      const prevVector: SHARED.TYPES.Vector2 = this.map.area[deltaIndex]

      const cond1: boolean = (currVector.y > vector.y) != (prevVector.y > vector.y)
      const delta: number = (prevVector.x - currVector.x) * (vector.y - currVector.y) / (prevVector.y - currVector.y) + currVector.x
      const cond3: boolean = vector.x < delta

      if (cond1 && cond3) inPolygon = !inPolygon

      deltaIndex = index
    })

    return inPolygon
  }

  /**
   * Check if vector out of zone
   * @param {SHARED.TYPES.Vector2} vector 
   */
  out(vector: SHARED.TYPES.Vector2) : boolean {
    return !!!this.in(vector)
  }

  /**
   * Return a center vector of map
   * @return {SHARED.TYPES.Vector2}
   */
  center(): Vector3Mp {
    const x = this.map.area.map(vector => vector.x)
    const y = this.map.area.map(vector => vector.y)

    const centerX = (Math.min(...x) + Math.max(...x)) / 2
    const centerY = (Math.min(...y) + Math.max(...y)) / 2

    const { z } = this.map.spawnPoints.ATTACKERS[0]

    return new mp.Vector3(centerX, centerY, z)
  }
}