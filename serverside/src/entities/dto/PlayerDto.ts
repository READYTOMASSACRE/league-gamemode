import { validatorFactory } from '../../validators/validatorFactory'

class PlayerDto {
  static validators = {
    model: "number",
    position: "vector"
  }

  static availableKeys: ["model", "position"] = ["model", "position"]

  private validated: string[] = []

  constructor(
    public readonly player: PlayerMp,
    private readonly dto: Partial<PlayerMp>
  ) {}

  isValid(): boolean {
    this.validated = Object.entries(PlayerDto.validators)
      .filter(([key, name]) => {
        const value = this.dto[key as keyof PlayerMp]

        return (typeof value !== 'undefined') && validatorFactory(name as any)(value)
      })
      .map(([key]) => key)

    return !!this.validated.length
  }

  save(): boolean {
    return !!PlayerDto.availableKeys.filter(key => {
      if (!this.validated.includes(key)) return false
      if (typeof this.dto[key] === 'undefined') return false

      this.player[key] = this.dto[key] as any

      return true
    }).length
  }
}

export { PlayerDto }