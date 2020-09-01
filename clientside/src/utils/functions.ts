import { callBrowser } from "rage-rpc"
import { print } from "./print"
import { format } from 'util'
import { errorHandler } from "../bootstrap"
import { weapons } from "../declarations/weapons"

/**
 * object.padding(number, string)
 * Transform the string object to string of the actual width filling by the padding character (by default ' ')
 * Negative value of width means left padding, and positive value means right one
 *
 * @param       number  Width of string
 * @param       string  Padding chacracter (by default, ' ')
 * @return      string
 * @access      public
 */
String.prototype.padding = function(n: number, c?: string): string {
  let val = this.valueOf()
  if ( Math.abs(n) <= val.length ) return val
  const m = Math.max((Math.abs(n) - this.length) || 0, 0)
  const pad = Array(m + 1).join(String(c || ' ').charAt(0))

  return (n < 0) ? pad + val : val + pad
}

const bindedHoldedHandlers: { [keyCode: number]: Function[] } = {}
const bindedHandlers: { [keyCode: number]: Function[] } = {}

/**
 * Bind the handler by key in to the Rage API
 * @param {number[]} keys - key code
 * @param {boolean} keyHold  - key state
 * @param {Function} handler 
 */
function keyBind(keys: number[], keyHold: boolean, handler: Function): void {
  keys.forEach(keycode => {
    if (typeof bindedHoldedHandlers[keycode] === 'undefined') bindedHoldedHandlers[keycode] = []
    if (typeof bindedHandlers[keycode] === 'undefined') bindedHandlers[keycode] = []

    let finded = keyHold
      ? bindedHoldedHandlers[keycode].find(func => func === handler)
      : bindedHandlers[keycode].find(func => func === handler)

    // try to avoid double binding similar handlers
    if (typeof finded !== 'undefined') return

    mp.keys.bind(keycode, keyHold, handler)

    if (keyHold) {
      bindedHoldedHandlers[keycode].push(handler)
    } else {
      bindedHandlers[keycode].push(handler)
    }
  })
}

/**
 * Unbind the handler by key
 * @param {number[]} keys - key code
 * @param {boolean} keyHold  - key state
 * @param {Function} handler 
 */
function keyUnbind(keys: number[], keyHold: boolean, handler?: Function): void {
  keys.forEach(keycode => {
    if (typeof bindedHoldedHandlers[keycode] === 'undefined') bindedHoldedHandlers[keycode] = []
    if (typeof bindedHandlers[keycode] === 'undefined') bindedHandlers[keycode] = []

    if (keyHold) {
      bindedHoldedHandlers[keycode] = bindedHoldedHandlers[keycode].filter(func => func !== handler)
    } else {
      bindedHandlers[keycode] = bindedHandlers[keycode].filter(func => func !== handler)
    }

    mp.keys.unbind(keycode, keyHold, handler)
  })
}

/**
 * Pass a message to the console.log into cef
 * @param {any[]} args - the args which will be passed into the browser
 */
function logbrowser(...args: any[]) {
  const browser = mp.browsers.toArray().find(browser => browser.url === ENUMS.CEF.MAIN)

  if (browser) {
    try {
      callBrowser(browser, SHARED.RPC.CLIENT_CONSOLE, format("", ...args))
    } catch (err) {
      callBrowser(browser, SHARED.RPC.CLIENT_CONSOLE, format("", err.stack))
    }
  }
}

/**
 * Convert hex to rgba
 * @param {string} hex 
 * @param {number} alpha (optional)
 */
function hex2rgba(hex: string, alpha = 255): RGBA {
  const matched = hex.match(/\w\w/g)
  if (!matched) throw new Error("Invalid hex")

  const [r, g, b] = matched.map(x => parseInt(x, 16))

  return [r, g, b, alpha]
}

/**
 * Calculate the gradient by fadeFraction range [0...1]
 * @param {number} fadeFraction 
 * @param {RGB} color1 
 * @param {RGB} color2 
 */
function colorGradient(fadeFraction: number, color1: RGB, color2: RGB): any {
  const diffRed   = color2[0] - color1[0]
  const diffGreen = color2[1] - color1[1]
  const diffBlue  = color2[2] - color1[2]

  return [
    Math.floor(color1[0] + (diffRed * fadeFraction)),
    Math.floor(color1[1] + (diffGreen * fadeFraction)),
    Math.floor(color1[2] + (diffBlue * fadeFraction)),
  ]
}

/**
 * Format current time
 */
function getFormattedCurrentTime(): string {
  const d               = new Date()
  const hours           = d.getHours().toString().padStart(2, '0')
  const minutes         = d.getMinutes().toString().padStart(2, '0')
  const seconds         = d.getSeconds().toString().padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
}

/**
 * Return a weapon's name
 * @param {RageEnums.Hashes.Weapon} hash 
 */
function getWeaponName(hash: RageEnums.Hashes.Weapon): string {
  return weapons[hash]
}

interface ThrottleSettings {

  /**
  * If you'd like to disable the leading-edge call, pass this as false.
  **/
  leading?: boolean;

  /**
  * If you'd like to disable the execution on the trailing-edge, pass false.
  **/
  trailing?: boolean;
}
interface Cancelable {
  cancel(): void;
}
// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle<T extends Function>(
  func: T,
  wait: number,
  options?: ThrottleSettings): T & Cancelable {
  var timeout: any, context: any, args: any, result: any
  var previous = 0
  if (!options) options = {}

  var later = function() {
    previous = options!.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  };

  var throttled: any = function() {
    var _now = Date.now()
    if (!previous && options!.leading === false) previous = _now
    var remaining = wait - (_now - previous)
    // @ts-ignore
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = _now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options!.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  };

  throttled.cancel = function() {
    clearTimeout(timeout)
    previous = 0
    timeout = context = args = null
  }

  return throttled
}

/**
 * Escape a regexp pattern
 * @param {string} string 
 */
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Check if parameter is number
 * @param {string} n 
 */
function isNumber(n: string) {
  return !isNaN(parseFloat(n)) && !isNaN(+n - 0)
}

export { keyBind, keyUnbind, logbrowser, hex2rgba, colorGradient, getFormattedCurrentTime, getWeaponName, throttle, escapeRegExp, isNumber }