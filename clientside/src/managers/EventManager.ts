import { singleton, autoInjectable } from 'tsyringe'
import { DummyMapManager } from './dummies/DummyMapManager'
import { DummyConfigManager } from './dummies/DummyConfigManager'
import { event, eventable } from 'rage-decorators'
import { DummyPlayerStatManager } from './dummies/DummyPlayerStatManager'
import { ErrorHandler } from '../core/ErrorHandler'
import { PlayerManager } from './PlayerManager'
import { DummyRoundStatManager } from './dummies/DummyRoundStatManager'
import { DummyLanguageManager } from './dummies/DummyLanguageManager'

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
    readonly dummyLanguageManager: DummyLanguageManager,
    readonly playerManager: PlayerManager,
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
    this.dummyLanguageManager.registerDummies()
    this.dummyMapManager.registerDummies()
    this.dummyConfigManager.registerDummies()
    this.dummyStatManager.registerDummies()
    this.dummyRoundStatManager.registerDummies()

    // init shareddata
    this.playerManager.initData()

    // init language
    const defaultLanguage = this.dummyConfigManager.getDefaultLanguage()
    this.playerManager.loadLanguage(defaultLanguage)

    // call en event that all dummies are registered
    mp.events.call(SHARED.EVENTS.CLIENT_DUMMIES_READY)
  }
}

export { EventManager }