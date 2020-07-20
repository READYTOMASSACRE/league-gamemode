import { singleton, autoInjectable } from "tsyringe"
import { Language } from "../core/Language"
import { commandable, command } from "rage-decorators"
import { ErrorHandler } from "../core/ErrorHandler"
import { BrowserManager } from "./BrowserManager"

/**
 * Class to manage the client language
 */
@singleton()
@commandable()
@autoInjectable()
class LanguageManager {
  constructor (
    readonly lang: Language,
    readonly errHandler: ErrorHandler,
    readonly browserManager: BrowserManager,
  ) {
    this.changeLanguage = this.changeLanguage.bind(this)
  }
  
  /**
   * Load the available language
   * @param {string} lang 
   */
  loadLanguage(lang?: string): void {
    try {
      this.lang.load(lang)
      this.browserManager.callBrowser(ENUMS.CEF.MAIN, SHARED.RPC.CLIENT_LANGUAGE, this.lang.toPlainObject())
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Get an access to change the current language
   * @param {string} cmdDesc 
   * @param {string} lang - code of the language
   */
  @command(["cl", "changelang"], { desc: "{{cmdName}}" })
  changeLanguage(cmdDesc: string, lang: string): void {
    try {
      if (!lang) {
        mp.gui.chat.push(
          this.lang
            .get(SHARED.MSG.CMD_DESC_CHANGE_LANG)
            .replace("{{cmdName}}", cmdDesc)
        )
      } else {
        this.loadLanguage(lang)
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }
}

export { LanguageManager }