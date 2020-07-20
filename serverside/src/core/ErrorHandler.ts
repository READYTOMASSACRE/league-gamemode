import { PlayerNotifyError } from "../errors/PlayerErrors"
import { LogError, ConsoleError } from "../errors/LogErrors"
import { red } from "colors"
import { singleton } from "tsyringe"

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
    } else if (err instanceof LogError) {
      return this.logError(err)
    } else {
      return this.error(err)
    }
  }

  /**
   * Notify player about an error
   * @param {PlayerNotifyError} err - the object of an error
   */
  private playerNotifyError<E extends PlayerNotifyError>(err: E): boolean {
    if (err.player) {
      const players = Array.isArray(err.player) && err.player || [err.player]

      players.forEach(player => {
        if (mp.players.exists(player)) {

          const args = [err.constructor.name, err.message, ...(err.args || [])]
          player.call(SHARED.EVENTS.SERVER_NOTIFY_ERROR, args)
        }
      })

      return true
    }

    return false
  }

  /**
   * Log an error
   * @param {LogError} err  - the object of an error
   */
  private logError<E extends LogError>(err: E): boolean {
    if (err instanceof ConsoleError) {
      const colorFunc = typeof err.colorFunc === 'function' && err.colorFunc || red
      console.error(colorFunc('[ERR]'), err.stack)

      return true
    }

    return false
  }

  private error<E extends Error>(err: E): boolean {
    console.error(red('[NOT_HANDLED_ERR]'), err.stack)
    return true
  }
}

export { ErrorHandler }