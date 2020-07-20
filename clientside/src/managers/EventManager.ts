import { singleton, autoInjectable } from 'tsyringe'
import { DummyMapManager } from './dummies/DummyMapManager'
import { DummyConfigManager } from './dummies/DummyConfigManager'
import { event, eventable } from 'rage-decorators'
import { LanguageManager } from './LanguageManager'
import { DummyPlayerStatManager } from './dummies/DummyPlayerStatManager'
import { ErrorHandler } from '../core/ErrorHandler'
import { PlayerManager } from './PlayerManager'
import { DummyRoundStatManager } from './dummies/DummyRoundStatManager'

/**
 * Class to invoke complex managers by some events
 */
@singleton()
@eventable()
@autoInjectable()
class EventManager {
  constructor(
    readonly dummyMapManager: DummyMapManager,
    readonly dummyConfigManager: DummyConfigManager,
    readonly dummyStatManager: DummyPlayerStatManager,
    readonly dummyRoundStatManager: DummyRoundStatManager,
    readonly playerManager: PlayerManager,
    readonly languageManager: LanguageManager,
    readonly errHandler: ErrorHandler,
  ) {
    this.serverPlayerReady = this.serverPlayerReady.bind(this)
  }

  /**
   * Event
   * 
   * Fires when the server says that player is ready
   */
  @event(SHARED.EVENTS.SERVER_PLAYER_READY)
  serverPlayerReady(): void {
    // register dummies
    this.dummyMapManager.registerDummies()
    this.dummyConfigManager.registerDummies()
    this.dummyStatManager.registerDummies()
    this.dummyRoundStatManager.registerDummies()

    // load language
    this.languageManager.loadLanguage(this.dummyConfigManager.getDefaultLanguage())

    // init shareddata
    this.playerManager.initData()

    // call en event that all dummies are registered
    mp.events.call(SHARED.EVENTS.CLIENT_DUMMIES_READY)
  }
}

export { EventManager }