import { PlayerNotifyError } from "../errors/PlayerErrors"
import { ConsoleError } from "../errors/LogErrors"
import { singleton } from "tsyringe"
import { print } from "../utils"

/**
 * Class of error handling
 */
@singleton()
class ErrorHandler {
  /**
   * Handle error
   * @param {Error} err - the object of an error
   */
  handle<E extends Error>(err: E): boolean {
    if (err instanceof PlayerNotifyError) {
      return this.playerNotifyError(err)
    } else if (err instanceof ConsoleError) {
      return this.logError(err)
    } else if (err instanceof Error) {
      return this.error(err)
    } else {
      throw err
    }
  }

  /**
   * Notify player about an error
   * @param {PlayerNotifyError} err - the object of an error
   */
  private playerNotifyError<E extends PlayerNotifyError>(err: E): boolean {
    mp.gui.chat.push(err.message)

    return true
  }

  /**
   * Log an error
   * @param {LogError} err  - the object of an error
   */
  private logError<E extends ConsoleError>(err: E): boolean {
    print.error('[ERR]', err.stack)

    return true
  }

  /**
   * Log an error, but notice that is not handled by any types
   * @param {LogError} err  - the object of an error
   */
  private error<E extends Error>(err: E): boolean {
    print.error('[NOT_HANDLED_ERR]', err.stack)

    return true
  }
}

export { ErrorHandler }