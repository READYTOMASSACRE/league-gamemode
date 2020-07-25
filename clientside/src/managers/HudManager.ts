import { singleton, autoInjectable } from "tsyringe"
import { eventable, event } from "rage-decorators"
import { DummyConfigManager } from "./dummies/DummyConfigManager"
import { Nametag } from "../hud/Nametag"
import { ErrorHandler } from "../core/ErrorHandler"
import { RoundInfo } from "../hud/RoundInfo"
import { VotemapNotify, NominateMaps } from "../hud/VotemapNotify"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"
import { TeamSelecting } from "../hud/TeamSelecting"
import { DialogManager } from "./DialogManager"
import { BrowserManager } from "./BrowserManager"
import { PlayerManager } from "./PlayerManager"
import { getFormattedCurrentTime } from "../utils"

/**
 * Class to manage the hud elements
 */
@singleton()
@eventable()
@autoInjectable()
class HudManager {
  readonly roundInfo        : RoundInfo
  readonly teamSelecting    : TeamSelecting
  readonly votemapNotify    : VotemapNotify

  private nametag           : Nametag

  constructor(
    readonly dummyConfig    : DummyConfigManager,
    readonly lang           : DummyLanguageManager,
    readonly errHandler     : ErrorHandler,
    readonly dialogManager  : DialogManager,
    readonly browserManager : BrowserManager,
    readonly playerManager  : PlayerManager,
  ) {
    this.nametag              = new Nametag(this.dummyConfig, this.lang, this.errHandler)
    this.roundInfo            = new RoundInfo(this.dummyConfig, this.lang, this.errHandler, this.dialogManager, this.browserManager, this.playerManager)
    this.votemapNotify        = new VotemapNotify(this.dummyConfig, this.lang, this.errHandler)
    this.teamSelecting        = new TeamSelecting(this.dummyConfig, this.lang, this.errHandler)

    this.hudInit              = this.hudInit.bind(this)
    this.votemapStart         = this.votemapStart.bind(this)
    this.votemapUpdate        = this.votemapUpdate.bind(this)
    this.serverNotify         = this.serverNotify.bind(this)
    this.serverNotifyError    = this.serverNotifyError.bind(this)
  }

  /**
   * Event
   * 
   * Fires from clientside when the all dummies are registered
   */
  @event(SHARED.EVENTS.CLIENT_DUMMIES_READY)
  private hudInit(): void {
    this.nametag.start()
  }

  /**
   * Event
   * 
   * Fires from serverside when the votemap has started
   */
  @event(SHARED.EVENTS.SERVER_VOTEMAP_START)
  private votemapStart(): void {
    this.votemapNotify.stop()
    this.votemapNotify.start()
  }

  /**
   * Event
   * 
   * Fires when a player has voted
   * Update data in the hud element
   * @param {NominateMaps} payload 
   */
  @event(SHARED.EVENTS.SERVER_VOTEMAP_UPDATE)
  private votemapUpdate(payload: NominateMaps): void {
    this.votemapNotify.update(payload)
  }

  /**
   * Event
   * 
   * Fires when the server has sent an error
   * 
   * @param {string} errName - the name of an error
   * @param {string} message - the error message
   * @param {string[]} args - additional info
   */
  @event(SHARED.EVENTS.SERVER_NOTIFY)
  private serverNotify(message: string, variant: SHARED.TYPES.NotifyVariantType): void {
    this.notify(message, variant)
  }

  /**
   * Event
   * 
   * Fires when the server has sent an error
   * 
   * @param {string} errName - the name of an error
   * @param {string} message - the error message
   * @param {string[]} args - additional info
   */
  @event(SHARED.EVENTS.SERVER_NOTIFY_ERROR)
  private serverNotifyError(errName: string, message: string, ...args: string[]): void {
    message = this.lang.get(message, ...args)
    this.notify(message, 'error')
  }

  /**
   * Notify a player
   * 
   * @param {string} message - text message
   * @param {SHARED.TYPES.NotifyVariantType} variant - notify type
   */
  notify(message: string, variant?: SHARED.TYPES.NotifyVariantType): void {
    variant = variant || 'info'
    mp.gui.chat.push(`[${getFormattedCurrentTime()}]: ${message}`)
    this.browserManager.callBrowser(ENUMS.CEF.MAIN, SHARED.RPC_DIALOG.CLIENT_NOTIFY_NOTISTACK, message, variant)
  }
}

export { HudManager }