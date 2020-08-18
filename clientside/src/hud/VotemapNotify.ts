import { Hud } from "./Hud"

type NominateMapInfo = {
  id: number
  owner: number
  vote: number[]
  code: string
  percent: number
}

export type NominateMaps = {
  [key: number]: NominateMapInfo
}

/**
 * Hud element - VotemapNotify
 */
class VotemapNotify extends Hud {
  static readonly SECOND = 1000

  private voteStart         : number = 0
  private secondInterval    : number  = 0
  private state             : NominateMaps = {}

  /**
   * @inheritdoc
   */
  start(): void {
    this.secondInterval = this.dummyConfig.getVoteIntervalSeconds()
    this.voteStart      = Date.now()

    mp.events.add(RageEnums.EventKey.RENDER, this.render)
    this.startTick()
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    mp.events.remove(RageEnums.EventKey.RENDER, this.render)
    this.stopTick()
  }

  /**
   * @inheritdoc
   */
  tick(): void {
    const timePassed    = Math.round((Date.now() - this.voteStart) / 1000)
    this.secondInterval = this.dummyConfig.getVoteIntervalSeconds() - timePassed

    if (this.secondInterval < 0) this.stop()
  }

  /**
   * Update the state of notify
   * @param {string} jsonData - data from server
   */
  update(state: NominateMaps): void {
    try {
      this.state = state
      this.updatePercents()
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * @inheritdoc
   */
  render(): void {
    try {
      const voteText = this.lang.get(SHARED.MSG.VOTEMAP_NOTIFY, this.secondInterval + 's')
      const nominatedMaps = this.getNominatedMaps()
      const y = 0.1
      const yDelta = 0.05
      let delta = yDelta
      const { scale: [ scaleX, scaleY ] } = this.textParams
  
      mp.game.graphics.drawText(voteText, [0.5, y], this.textParams)
      nominatedMaps.forEach(mapText => {
        mp.game.graphics.drawText(mapText, [0.5, y + delta], { ...this.textParams, scale: [scaleX-0.2, scaleY-0.2]})
        delta += yDelta
      })
    } catch (err) {
      this.stop()
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Update percents of voted players
   */
  private updatePercents(): void {
    const total = Object
      .values(this.state)
      .reduce((accumulator, current) => accumulator + current.vote.length, 0)

    Object
      .entries(this.state)
      .forEach(([key, data]) => {
        this.state[+key].percent = Math.round(data.vote.length * 100 / total)
      })
  }

  /**
   * Format output
   */
  private getNominatedMaps(): string[] {
    return Object
      .values(this.state)
      .map(({ code, vote, percent }) => 
        `${code} - ${vote.length}, ${percent}%`
      )
  }
}

export { VotemapNotify }