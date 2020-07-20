const epsilon = 0.00001

/**
 * Realization of vector [x,y]
 */
class Vector2 {
  constructor(private values: [number, number] = [0,0]) {}
  
  get x(): number { return this.values[0] }
  set x(value: number) { this.values[0] = value }
  
  get y(): number { return this.values[1] }
  set y(value: number) { this.values[1] = value }

  get xy(): [number, number] { return this.values }
  set xy(values: [number, number]) { this.values = values }

  at(index: number): number { return this.values[index] }

  /**
   * Reset vector data
   */
  reset(): void {  this.xy = [0,0] }

  /**
   * Copying current vector
   * 
   * @param {Vector2} dest - destination vector
   */
  copy(dest?: Vector2): Vector2 {
    if (!(dest instanceof Vector2)) dest = new Vector2()

    dest.xy = this.xy

    return dest
  }

  /**
   * Negatiate vector data
   * @param {Vector2} dest  - destination vector
   */
  negate(dest?: Vector2): Vector2 {
    if (!(dest instanceof Vector2)) dest = new Vector2()

    dest.xy = [-this.x, -this.y]

    return dest
  }

  /**
   * Check if current vector equlas the same in parameters
   * @param {Vector2} vector - the same vector
   * @param {number}  threshold - epsilon
   */
  equals(vector: Vector2, threshold = epsilon): boolean {
    if (Math.abs(this.x - vector.x) > threshold) return false

    if (Math.abs(this.y - vector.y) > threshold) return false

    return true
  }

  /**
   * Get the length vector
   */
  length(): number {
    return Math.sqrt(this.squaredLength())
  }

  /**
   * Make square vector
   */
  squaredLength(): number {
    const x = this.x
    const y = this.y

    return (x * x + y * y)
  }

  /**
   * Make the add operation with another vector
   * @param {Vector2} vector vector which should be add with the current
   */
  add(vector: Vector2): Vector2 {
    this.x += vector.x
    this.y += vector.y

    return this
  }

  /**
   * Make the subtract operation with another vector
   * @param {Vector2} vector vector which should be substract with the current
   */
  subtract(vector: Vector2): Vector2 {
    this.x -= vector.x
    this.y -= vector.y

    return this
  }

  /**
   * Make the multiply operation with another vector
   * @param {Vector2} vector vector which should be multiply with the current
   */
  multiply(vector: Vector2): Vector2 {
    this.x *= vector.x
    this.y *= vector.y

    return this
  }

  /**
   * Make the divide operation with another vector
   * @param {Vector2} vector vector which should be divide with the current
   */
  divide(vector: Vector2): Vector2 {
    this.x /= vector.x
    this.y /= vector.y

    return this
  }

  /**
   * Make the scale with vector and return new vector
   * @param {number} value scale number
   * @param {Vector2} dest copy to another vector if it necessary
   */
  scale(value: number, dest?: Vector2): Vector2 {
    if (!dest) dest = this

    dest.x *= value
    dest.y *= value

    return dest
  }

  /**
   * Normalize vector and return new
   * @param {Vector2} dest copy to another vector if it necessary
   */
  normalize(dest?: Vector2): Vector2 {
    if (!dest) dest = this

    let length = this.length()

    if (length === 1) return this

    if (length === 0) {
        dest.x = 0
        dest.y = 0

        return dest
    }

    length = 1.0 / length

    dest.x *= length
    dest.y *= length

    return dest
  }

  /**
   * Multiply two vectors
   * @param {Vector2} vector first vector
   * @param {Vector2} vector2 second vector
   */
  static dot(vector: Vector2, vector2: Vector2): number {
    return (vector.x * vector2.x + vector.y * vector2.y)
  }

  /**
   * Calculate a distance between two vectors
   * @param {Vector2} vector first vector
   * @param {Vector2} vector2 second vector
   */
  static distance(vector: Vector2, vector2: Vector2): number {
    return Math.sqrt(this.squaredDistance(vector, vector2))
  }

  /**
   * Calculate a square distance between two vectors
   * @param {Vector2} vector first vector
   * @param {Vector2} vector2 second vector
   */
  static squaredDistance(vector: Vector2, vector2: Vector2): number {
    const x = vector2.x - vector.x
    const y = vector2.y - vector.y

    return (x * x + y * y)
  }

  /**
   * Calculate a direction between two vectors
   * @param {Vector2} vector first vector
   * @param {Vector2} vector2 second vector
   * @param {Vector2} dest copy to another vector if it necessary 
   */
  static direction(vector: Vector2, vector2: Vector2, dest?: Vector2): Vector2 {
    if (!dest) dest = new Vector2()

    const x = vector.x - vector2.x
    const y = vector.y - vector2.y

    let length = Math.sqrt(x * x + y * y)

    if (length === 0) {
        dest.x = 0
        dest.y = 0

        return dest
    }

    length = 1 / length

    dest.x = x * length
    dest.y = y * length

    return dest
  }

  /**
   * Mix two vectors by time
   * @param {Vector2} vector first vector
   * @param {Vector2} vector2 second vector
   * @param {number}  time time number
   * @param {Vector2} dest copy to another vector if it necessary 
   */
  static mix(vector: Vector2, vector2: Vector2, time: number, dest?: Vector2): Vector2 {
    if (!dest) dest = new Vector2()

    const x = vector.x
    const y = vector.y

    const x2 = vector2.x
    const y2 = vector2.y

    dest.x = x + time * (x2 - x)
    dest.y = y + time * (y2 - y)

    return dest
  }

  /**
   * Calculate a sum between two vectors
   * @param {Vector2} vector first vector
   * @param {Vector2} vector2 second vector
   * @param {Vector2} dest copy to another vector if it necessary 
   */
  static sum(vector: Vector2, vector2: Vector2, dest?: Vector2): Vector2 {
    if (!dest) dest = new Vector2()

    dest.x = vector.x + vector2.x
    dest.y = vector.y + vector2.y

    return dest
  }

  /**
   * Calculate a difference between two vectors
   * @param {Vector2} vector first vector
   * @param {Vector2} vector2 second vector
   * @param {Vector2} dest copy to another vector if it necessary 
   */
  static difference(vector: Vector2, vector2: Vector2, dest?: Vector2): Vector2 {
    if (!dest) dest = new Vector2()

    dest.x = vector.x - vector2.x
    dest.y = vector.y - vector2.y

    return dest
  }

  /**
   * Calculate a product between two vectors
   * @param {Vector2} vector first vector
   * @param {Vector2} vector2 second vector
   * @param {Vector2} dest copy to another vector if it necessary 
   */
  static product(vector: Vector2, vector2: Vector2, dest?: Vector2): Vector2 {
    if (!dest) dest = new Vector2()

    dest.x = vector.x * vector2.x
    dest.y = vector.y * vector2.y

    return dest
  }

  /**
   * Calculate a quotient between two vectors
   * @param {Vector2} vector first vector
   * @param {Vector2} vector2 second vector
   * @param {Vector2} dest copy to another vector if it necessary 
   */
  static quotient(vector: Vector2, vector2: Vector2, dest?: Vector2): Vector2 {
    if (!dest) dest = new Vector2()

    dest.x = vector.x / vector2.x
    dest.y = vector.y / vector2.y

    return dest
  }

  toJSON() {
    return [this.x, this.y]
  }
}

export { Vector2, epsilon }