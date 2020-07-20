import { singleton, autoInjectable } from "tsyringe"
import { eventable, event } from "rage-decorators"
import { DummyConfigManager } from "./dummies/DummyConfigManager"
import { Nametag } from "../hud/Nametag"
import { ErrorHandler } from "../core/ErrorHandler"
import { RoundInfo } from "../hud/RoundInfo"
import { Language } from "../core/Language"
import { VotemapNotify } from "../hud/VotemapNotify"

/**
 * Class to manage the hud elements
 */
@singleton()
@eventable()
@autoInjectable()
class HudManager {
  public readonly roundInfo   : RoundInfo

  private nametag             : Nametag
  private votemapNotify       : VotemapNotify

  constructor(
    readonly dummyConfig    : DummyConfigManager,
    readonly lang           : Language,
    readonly errHandler     : ErrorHandler,
  ) {
    this.nametag          = new Nametag(this.dummyConfig, this.errHandler)
    this.roundInfo        = new RoundInfo(this.dummyConfig, this.lang, this.errHandler)
    this.votemapNotify    = new VotemapNotify(this.dummyConfig, this.lang, this.errHandler)
    this.hudInit          = this.hudInit.bind(this)
    this.votemapStart     = this.votemapStart.bind(this)
  }

  /**
   * Event
   * 
   * Fires from clientside when the all dummies are registered
   */
  @event(SHARED.EVENTS.CLIENT_DUMMIES_READY)
  hudInit(): void {
    this.nametag.start()
  }

  /**
   * Event
   * 
   * Fires from serverside when the votemap has started
   */
  @event(SHARED.EVENTS.SERVER_VOTEMAP_START)
  votemapStart(): void {
    this.votemapNotify.start()
  }
}

export { HudManager }