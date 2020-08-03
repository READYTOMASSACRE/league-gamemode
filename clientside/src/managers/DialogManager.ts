import { singleton, injectable } from "tsyringe"
import { BrowserManager } from "./BrowserManager"
import { ErrorHandler } from "../core/ErrorHandler"

/**
 * Class to manage UI dialogs
 */
@singleton()
@injectable()
class DialogManager {
  private toggleMap: { [key: string]: boolean } = {}

  constructor(
    readonly browserManager: BrowserManager,
    readonly errHandler: ErrorHandler,
  ) {}

  /**
   * Open the dialog by RPC_OPEN_DIALOG
   * @param {SHARED.RPC_DIALOG} RPC_OPEN_DIALOG 
   * @param {any[]} args - params which whill be passed in to the dialog
   */
  open(RPC_OPEN_DIALOG: SHARED.RPC_DIALOG, ...args: any[]) {
    try {
      this.browserManager.callBrowser(ENUMS.CEF.MAIN, RPC_OPEN_DIALOG, ...args)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Close the dialog by RPC_OPEN_DIALOG
   * @param {SHARED.RPC_DIALOG} RPC_OPEN_DIALOG 
   */
  close(RPC_CLOSE_DIALOG: SHARED.RPC_DIALOG) {
    try {
      this.browserManager.callBrowser(ENUMS.CEF.MAIN, RPC_CLOSE_DIALOG)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Toggle the dialog by RPC_TOGGLE_DIALOG
   */
  toggle(RPC_TOGGLE_DIALOG: SHARED.RPC_DIALOG) {
    try {
      if (typeof this.toggleMap[RPC_TOGGLE_DIALOG] === 'undefined') {
        this.toggleMap[RPC_TOGGLE_DIALOG] = false
      }

      this.toggleMap[RPC_TOGGLE_DIALOG] = !this.toggleMap[RPC_TOGGLE_DIALOG]

      if (this.toggleMap[RPC_TOGGLE_DIALOG]) {
        this.onOpen()
      } else {
        this.onClose()
      }

      this.browserManager.callBrowser(ENUMS.CEF.MAIN, RPC_TOGGLE_DIALOG, this.toggleMap[RPC_TOGGLE_DIALOG])
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * @todo change it when the callProc will available in prerelase or above version
   * 
   * RPC
   * 
   * Fires from CEF when the dialog is opened
   */
  onOpen(): void {
    mp.gui.cursor.visible = true
  }

  /**
   * @todo change it when the callProc will available in prerelase or above version
   * 
   * RPC
   * 
   * Fires from CEF when the dialog is closed
   */
  onClose(): void {
    mp.gui.cursor.visible = false
  }
}

export { DialogManager }