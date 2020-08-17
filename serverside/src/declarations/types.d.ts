declare namespace TYPES {
  /**
   * Interface of Vector2
   */
  type Vector2 = {
    new([x, y]?: [number, number]): Vector2

    x: number
    y: number
    xy: [number, number]
  
    at(index: number): number
    reset(): void
    copy(dest?: Vector2): Vector2
    negate(dest?: Vector2): Vector2
    equals(vector: Vector2, threshold?: number): boolean
    length(): number
    squaredLength(): number
    add(vector: Vector2): Vector2
    subtract(vector: Vector2): Vector2
    multiply(vector: Vector2): Vector2
    divide(vector: Vector2): Vector2
    scale(value: number, dest?: Vector2): Vector2
    normalize(dest?: Vector2): Vector2
  }

  /**
   * Command callable type
   */
  type CommandCallable = (player: PlayerMp, fullText: string, ...args: string[]) => void

  /**
   * Types of records
   */
  type RoundStatRecord        = SHARED.TYPES.RoundStatDTO & { id: number }
}