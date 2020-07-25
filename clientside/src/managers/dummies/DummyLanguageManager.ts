import { Dummy } from "../../entities/Dummy"
import { format } from "util"
import { IsNotExistsError } from "../../errors/LogErrors"
import { singleton } from "tsyringe"

/**
 * Class to manage languages
 */
@singleton()
class DummyLanguageManager {
  private readonly type = SHARED.ENTITIES.LANGUAGE
  private _dummy?: Dummy<SHARED.ENTITIES.LANGUAGE>
  private player: PlayerMp = mp.players.local

  /**
   * Register all existing dummies
   */
  registerDummies(): void {
    mp.dummies.forEachByType(this.type, entity => {
      this._dummy = new Dummy(this.type, entity)
    })
  }

  /**
   * Get message by message id
   * 
   * @param id - message id
   * @param args - (optional) arguments to format message
   */
  get(id: string, ...args: string[]): string {
    const message = this.getMessages()[id]

    if (!message) return id

    return args.length && format(message, ...args) || message
  }

  /**
   * Get all messages by a language
   * @param {string} lang - langauge id
   */
  getMessages(lang?: string): any {
    const messages = this.dummy.data[lang || this.lang]

    if (typeof messages === 'undefined') {
      throw new IsNotExistsError(`Language ${this.lang} is not exists`)
    }

    return messages
  }

  /**
   * Get current language
   */
  private get lang(): string {
    return this.player.sharedData.lang
  }

  /**
   * Get language dummy
   */
  get dummy() {
    if (!this._dummy) throw new ReferenceError(SHARED.MSG.ERR_NOT_FOUND)

    return this._dummy
  }
}

export { DummyLanguageManager }