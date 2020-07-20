import { format } from "util"
import { singleton } from "tsyringe"
import { NotFoundNotifyError } from "../errors/PlayerErrors"
import { print } from "../utils"

/**
 * Manage language messages
 */
@singleton()
class Language {
  static readonly EXT   = ".json"
  static readonly DIR   = 'lang'
  static readonly LANG  = "en"

  private messages    : Map<string, string> = new Map()

  /**
   * Set up app language
   * @param language - loading language, default en
   */
  load(language?: string): void {
    try {
      const languages: { [key: string]: string } = require(`../../lang/${language || Language.LANG}.json`)
  
      this.messages = new Map()
  
      Object
        .entries(languages)
        .forEach(([id, msg]) => this.messages.set(id, msg))
    } catch (err) {
      throw new NotFoundNotifyError(this.get(SHARED.MSG.ERR_LANG_NOT_FOUND, language))
    }
  }

  /**
   * Get message by id
   * 
   * @param id - message id
   * @param args - (optional) arguments to format message
   */
  get(id: string, ...args: any[]): string {
    const message = this.messages.get(id)

    if (!message) return id

    return args.length && format(message, ...args) || message
  }

  /**
   * Get all messages
   */
  getMessages(): Map<string, string> {
    return this.messages
  }

  /**
   * Makes the messages to a plain object
   */
  toPlainObject(): any {
    const plainObject: any = {}

    this.messages.forEach((value, key) => plainObject[key] = value)

    return plainObject
  }
}

export { Language }