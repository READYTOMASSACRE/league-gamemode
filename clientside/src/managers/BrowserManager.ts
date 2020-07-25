import { singleton, autoInjectable } from "tsyringe"
import { callBrowser } from "rage-rpc"
import { event, eventable } from "rage-decorators"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"

/**
 * Class to manage client browsers
 */
@singleton()
@eventable()
@autoInjectable()
class BrowserManager {
  private browser: Map<string, BrowserMp> = new Map()

  constructor(readonly lang: DummyLanguageManager) {
    this.browserInit = this.browserInit.bind(this)
  }

  /**
   * Event
   * 
   * Fires when the player is ready
   * and need to register the CEF UI
   */
  @event(RageEnums.EventKey.PLAYER_READY)
  browserInit(): void {
    this.browser.set(ENUMS.CEF.MAIN, mp.browsers.new(ENUMS.CEF.MAIN))

    mp.events.call(SHARED.EVENTS.CLIENT_BROWSER_READY)
  }

  /**
   * Reload the browser
   * @param {string} packageName 
   * @param {boolean} ignoreCache (optional)
   */
  reload(packageName: string, ignoreCache?: boolean): void {
    const browser = this.browser.get(packageName)
    if (browser) browser.reload(!!ignoreCache)
  }

  /**
   * Reload all browsers
   * @param {boolean} ignoreCache (optional)
   */
  reloadAll(ignoreCache?: boolean): void {
    this.browser.forEach((browser) => browser.reload(!!ignoreCache))
  }

  /**
   * Destroy the browser
   * @param {string} packageName 
   */
  destroy(packageName: string): void {
    const browser = this.browser.get(packageName)
    if (browser) {
      browser.destroy()
      this.browser.delete(packageName)
    }
  }

  /**
   * Destroy all browsers
   */
  destroyAll(): void {
    this.browser.forEach((_, name) => this.destroy(name))
  }

  /**
   * Get the browser by packageName
   * @param {ENUMS.CEF} packageName 
   */
  get(packageName: ENUMS.CEF): BrowserMp {
    const browser = this.browser.get(packageName)
    
    if (!browser) throw new Error(this.lang.get(SHARED.MSG.ERR_NOT_FOUND))

    return browser
  }

  /**
   * Log into browser
   * @param {any[]} args - params which passed into browser
   */
  log(...args: any[]) {
    return this.callBrowser(ENUMS.CEF.MAIN, SHARED.RPC.CLIENT_CONSOLE, ...args)
  }

  /**
   * @todo change it when the callProc will available in prerelase or above version
   * 
   * Invoke the procedure into browser with RPC CALL
   * @param {ENUMS.CEF} packageName - the name of package
   * @param {SHARED.RPC | SHARED.RPC_DIALOG} RPC_PROCEDURE - the name of RPC procedure
   * @param {any[]} args - the args which will be passed in to the browser
   */
  callBrowser(packageName: ENUMS.CEF, RPC_PROCEDURE: SHARED.RPC | SHARED.RPC_DIALOG, ...args: any[]) {
    const browser = this.get(packageName)

    return callBrowser(browser, RPC_PROCEDURE, args)
  }
}

export { BrowserManager }