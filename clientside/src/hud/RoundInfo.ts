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

  private remaining       : number = 0
  private state?          : InfoPanel
  private delay           : number = 0
  constructor(
    readonly dummyConfig: DummyConfigManager,
    readonly lang: DummyLanguageManager,
    readonly errHandler: ErrorHandler,
    readonly dialogManager: DialogManager,
    readonly browserManager: BrowserManager,
    readonly playerManager: PlayerManager,
  ) {
    super(dummyConfig, lang, errHandler)
  }

  /**
   * @inheritdoc
   */
  start(payload: Partial<InfoPanel>): void {
    this.stopped = false
    this.resetRoundSeconds()
    this.update(payload)
    this.dialogManager.open(SHARED.RPC_DIALOG.CLIENT_INFOPANEL_TOGGLE, true)

    // set up observable function per RoundInfo.SECOND
    this.tick(() => this.tickUpdate())
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    this.dialogManager.open(SHARED.RPC_DIALOG.CLIENT_INFOPANEL_TOGGLE, false)
    this.stopTick()
  }

  /**
   * Update the state of round info panel
   */
  tickUpdate(): void {
    const delay = Date.now()
    if (delay - this.delay >= DELAY_INSPECT) {
      this.delay = delay
      this.remaining -= 1
    }

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

  /**
   * Set round seconds from the server
   */
  private resetRoundSeconds(): void {
    this.remaining = this.dummyConfig.getRoundIntervalMinutes() * 60
  }
}

export { RoundInfo }