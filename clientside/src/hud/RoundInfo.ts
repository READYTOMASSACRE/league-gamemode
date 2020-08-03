import { Hud } from "./Hud"
import { DummyConfigManager, DummyLanguageManager, DialogManager, BrowserManager, PlayerManager } from "../managers"
import { ErrorHandler } from "../core/ErrorHandler"
import deepmerge from 'deepmerge'

export type InfoPanel = {
  time: string
  arena: string
  team: {
    [key in Exclude<SHARED.TEAMS, SHARED.TEAMS.SPECTATORS>]: {
      name: string
      color: string
      players: number[]
    }
  }
}

const DELAY_INSPECT = 1000

/**
 * Hud element - RoundInfo
 */
class RoundInfo extends Hud {
  protected readonly INTERVAL = 300

  private remaining             : number = 0
  private state?                : InfoPanel
  private roundStartDate        : number = 0
  private roundSecondInterval   : number = 0

  constructor(
    readonly dummyConfig    : DummyConfigManager,
    readonly lang           : DummyLanguageManager,
    readonly errHandler     : ErrorHandler,
    readonly dialogManager  : DialogManager,
    readonly browserManager : BrowserManager,
    readonly playerManager  : PlayerManager,
  ) {
    super(dummyConfig, lang, errHandler)

    this.drawPause = this.drawPause.bind(this)
  }

  /**
   * @inheritdoc
   */
  start(payload: Partial<InfoPanel>, roundIntervalMs: number): void {
    this.roundStartDate = Date.now()
    this.roundSecondInterval = Math.round(roundIntervalMs / 1000)

    this.resetRoundInterval()

    this.update(payload)
    
    // set up observable function per RoundInfo.SECOND
    this.tick(() => this.tickUpdate())

    this.dialogManager.open(SHARED.RPC_DIALOG.CLIENT_INFOPANEL_TOGGLE, true)
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    this.dialogManager.open(SHARED.RPC_DIALOG.CLIENT_INFOPANEL_TOGGLE, false)
    this.roundStartDate = 0
    this.stopTick()
  }

  /**
   * Update the state of round info panel
   */
  tickUpdate(): void {
    this.updateRoundTimeleft()

    const updatePlayerHealths: any = {
      ATTACKERS: { players: this.getPlayerHealths(SHARED.TEAMS.ATTACKERS) },
      DEFENDERS: { players: this.getPlayerHealths(SHARED.TEAMS.DEFENDERS) },
    }

    this.update({
      time: this.formatTimeRemaining(),
      team: updatePlayerHealths
    })
  }

  /**
   * Update the current state of panel
   * @param {string | Partial<InfoPanel>} payload
   */
  update(payload: Partial<InfoPanel>): void {
    try {
      if (!this.state) {
        this.state = this.getDefaultState()
      }
      this.state = deepmerge(this.state, payload, { arrayMerge: (_, source) => source })
      this.browserManager.callBrowser(ENUMS.CEF.MAIN, SHARED.RPC.CLIENT_INFOPANEL_DATA, this.state)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Start drawing a message about pause
   */
  startPause(): void {
    mp.events.add(RageEnums.EventKey.RENDER, this.drawPause)

    const currentDate           = Date.now()
    const timePassed            = Math.round((currentDate - this.roundStartDate)/1000)
    this.roundSecondInterval    = this.roundSecondInterval - timePassed

    this.stopTick()
  }

  /**
   * Stop drawing a message about pause
   */
  stopPause(): void {
    mp.events.remove(RageEnums.EventKey.RENDER, this.drawPause)
    this.roundStartDate = Date.now()
    this.tick(() => this.tickUpdate())
  }

  /**
   * Draw message that round is paused
   */
  drawPause(): void {
    try {
      const text = this.lang.get(SHARED.MSG.ROUND_PAUSED_MESSAGE)
  
      mp.game.graphics.drawText(text, [0.5, 0.5], this.textParams)
    } catch (err) {
      this.stopPause()
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Get player health info
   * @param {SHARED.TEAMS} teamId 
   */
  private getPlayerHealths(teamId: SHARED.TEAMS): number[] {
    const players = this.playerManager.getPlayersWithState([SHARED.STATE.ALIVE, SHARED.STATE.DEAD])

    return players
      .filter(player => player.sharedData.teamId === teamId)
      .map(player => player.getHealth())
  }

  /**
   * Get default state of panel
   */
  private getDefaultState(): InfoPanel {
    return {
      time: '00:00',
      arena: 'unknown',
      team: {
        ATTACKERS: {
          color: 'white',
          name: 'unkown',
          players: [],
        },
        DEFENDERS: {
          color: 'white',
          name: 'unkown',
          players: [],
        },
      }
    }
  }

  /**
   * Format time to render on the screen
   */
  private formatTimeRemaining(): string {
    const minutes = Math.floor(this.remaining / 60)
    const seconds = this.remaining - (minutes * 60)

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2,'0')}`
  }

  private resetRoundInterval(): void {
    this.roundSecondInterval = this.dummyConfig.getRoundIntervalMinutes() * 60
  }

  /**
   * Set round seconds from the server
   */
  private updateRoundTimeleft(): void {
    const pausedDate      = Date.now()
    const timePassed      = Math.round((pausedDate - this.roundStartDate) / 1000)

    this.remaining        = this.roundSecondInterval - timePassed
  }
}

export { RoundInfo }