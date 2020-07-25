import { resolve } from "path"
import { sync } from 'glob'
import { getProjectDir, getJsonFromFileSync } from "../../utils"
import { Dummy } from "../../entities/Dummy"
import { IsNotExistsError } from "../../errors/LogErrors"
import { format } from "util"
import { singleton } from "tsyringe"

/**
 * Class to manage languages
 */
@singleton()
class DummyLanguageManager implements INTERFACES.Manager {
  static readonly LANGUAGE_FOLDER = resolve(getProjectDir(), 'lang')

  private _dummy?: Dummy<SHARED.ENTITIES.LANGUAGE> 
  private loaded: boolean = false

  /**
   * @inheritdoc
   */
  load(): void {
    const languages = this.loadLanguages()

    this._dummy = new Dummy(SHARED.ENTITIES.LANGUAGE, languages)
    this.loaded = true
  }

  /**
   * Get message by lang and message id
   * 
   * @param lang - language id
   * @param id - message id
   * @param args - (optional) arguments to format message
   */
  get(lang: string, id: string, ...args: any[]): string {
    if (!this.loaded) {
      throw new Error("Dummy Language is not ready")
    }

    const messages = this.getMessages(lang)

    if (typeof messages === 'undefined') {
      throw new IsNotExistsError(`Language ${lang} is not exists`)
    }

    const message = messages[id]

    if (!message) return id

    return args.length && format(message, ...args) || message
  }

  /**
   * Get all messages by a language
   * @param {string} lang - langauge id
   */
  getMessages(lang: string): any {
    return this.dummy.data[lang]
  }

  /**
   * Load all languages from folder LANGUAGE_FOLDER
   */
  private loadLanguages(): KeyValueCollection {
    const pattern = '*.json'

    const languages: KeyValueCollection = {}

    const files = sync(resolve(DummyLanguageManager.LANGUAGE_FOLDER, pattern))

    const filepathRegexp = /^.*[\\\/]/
    files.forEach(fullpath => {
      const languageId = fullpath
        .replace(filepathRegexp, '')
        .replace('.json', '')
      
      const messages = getJsonFromFileSync(fullpath)

      languages[languageId] = messages
    })

    return languages
  }

  get dummy(): Dummy<SHARED.ENTITIES.LANGUAGE> {
    if (!this._dummy) throw new TypeError("Invalid language dummy")

    return this._dummy
  }
}

export { DummyLanguageManager }