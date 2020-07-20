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
}