import { singleton, autoInjectable } from "tsyringe"
import { DialogManager } from "./DialogManager"
import { keyBind } from "../utils"
import { BrowserManager } from "./BrowserManager"
import { eventable, event } from "rage-decorators"
import { DummyConfigManager } from "./dummies/DummyConfigManager"
import { DummyPlayerStatManager } from "./dummies/DummyPlayerStatManager"
import { ErrorHandler } from "../core/ErrorHandler"
import { callServer } from "rage-rpc"
import { DummyRoundStatManager } from "./dummies/DummyRoundStatManager"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"

/**
 * Class to manage the scoreboard
 */
@singleton()
@eventable()
@autoInjectable()
class ScoreboardManager {
  static readonly TICK_TIME = 1000

  private opened: boolean = false
  private ticking: boolean = false

  constructor(
    readonly dialogManager    : DialogManager,
    readonly browserManager   : BrowserManager,
    readonly dummyConfig      : DummyConfigManager,
    readonly dummyPlayerStat  : DummyPlayerStatManager,
    readonly dummyRoundStat   : DummyRoundStatManager,
    readonly errHandler       : ErrorHandler,
    readonly lang             : DummyLanguageManager,
  ) {
    this.open             = this.open.bind(this)
    this.close            = this.close.bind(this)
    this.onBrowserReady   = this.onBrowserReady.bind(this)
  }

  /**
   * Event
   * 
   * Fires when the clienside registered any browsers
   * Bind a keys which connected with open/close the scorebard window
   */
  @event(SHARED.EVENTS.CLIENT_BROWSER_READY)
  onBrowserReady(): void {
    this.bindKeys()
  }

  /**
   * Bind a keys
   */
  bindKeys(): void {
    keyBind([ENUMS.KEYCODES.VK_TILDE], true, this.open)
    keyBind([ENUMS.KEYCODES.VK_TILDE], false, this.close)
  }

  /**
   * Open the scoreboard
   */
  open(): void {
    this.opened = true
    this.tickCycle()
    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_SCOREBOARD_TOGGLE, true)
  }

  /**
   * Close the scoreboard
   */
  close(): void {
    this.opened = false
    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_SCOREBOARD_TOGGLE, false)
  }

  /**
   * A tick cycle to invoke the lifecycle of scoreboard window
   */
  private async tickCycle(): Promise<void> {
    if (!this.opened || this.ticking) return

    this.ticking = true
    await this.tick()

    setTimeout(() => {
      this.ticking = false
      this.tickCycle()
    }, ScoreboardManager.TICK_TIME)
  }

  /**
   * A tick to render the scoreboard
   */
  private async tick(): Promise<void> {
    try {
      const att = this.dummyConfig.getTeam(SHARED.TEAMS.ATTACKERS)
      const def = this.dummyConfig.getTeam(SHARED.TEAMS.DEFENDERS)
      
      const pings: TYPES.KeyNumberCollection = await callServer(SHARED.RPC.CLIENT_PING_REQUEST)
      
      const playerTeams = this.dummyPlayerStat.getPlayersInfo(pings)
      
      const data = {
        motd: this.dummyConfig.getServerName(),
        team: {
          [SHARED.TEAMS.ATTACKERS]: {
            name: att.NAME,
            color: att.COLOR,
            players: playerTeams.get(SHARED.TEAMS.ATTACKERS),
            score: this.dummyRoundStat.getScore(SHARED.TEAMS.ATTACKERS),
          },
          [SHARED.TEAMS.DEFENDERS]: {
            name: def.NAME,
            color: def.COLOR,
            players: playerTeams.get(SHARED.TEAMS.DEFENDERS),
            score: this.dummyRoundStat.getScore(SHARED.TEAMS.DEFENDERS),
          }
        }
      }
  
      this.browserManager.callBrowser(ENUMS.CEF.MAIN, SHARED.RPC.CLIENT_SCOREBOARD_DATA, data)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }
}

export { ScoreboardManager }