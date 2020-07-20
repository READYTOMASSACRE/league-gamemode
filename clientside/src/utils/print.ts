import { format } from 'util'

const enum LOG_TYPE {
  INFO  = "logInfo",
  WARN  = "logWarning",
  ERROR = "logError",
  FATAL = "logFatal",
  CLEAR = "clear",
  RESET = "reset",
}

/**
 * Print a message into the Rage console
 * @param {LOG_TYPE} TYPE 
 * @param {any[]} args - the args which will be passed into the console
 */
function message(TYPE: LOG_TYPE, ...args: any[]) {
  if (mp.console) {
    try {
      return mp.console[TYPE](format('', ...args) + "\n")
    } catch(err) {
      return mp.console.logError(err.stack + "\n")
    }
  } else {
    return console.log(...args)
  }
}

export const print = {
  info:  (...params: any[]) => message(LOG_TYPE.INFO, ...params),
  warn:  (...params: any[]) => message(LOG_TYPE.WARN, ...params),
  error: (...params: any[]) => message(LOG_TYPE.ERROR, ...params),
  fatal: (...params: any[]) => message(LOG_TYPE.FATAL, ...params),
  clear: (...params: any[]) => message(LOG_TYPE.CLEAR, ...params),
  reset: (...params: any[]) => message(LOG_TYPE.RESET, ...params),
}