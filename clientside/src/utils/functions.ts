import { callBrowser } from "rage-rpc"
import { print } from "./print"
import { format } from 'util'
import { errorHandler } from "../bootstrap"

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

/**
 * Bind the handler by key in to the Rage API
 * @param {number[]} keys - key code
 * @param {boolean} keyHold  - key state
 * @param {Function} handler 
 */
function keyBind(keys: number[], keyHold: boolean, handler: Function): void {
  keys.forEach(keycode => mp.keys.bind(keycode, keyHold, handler))
}

/**
 * Unbind the handler by key
 * @param {number[]} keys - key code
 * @param {boolean} keyHold  - key state
 * @param {Function} handler 
 */
function keyUnbind(keys: number[], keyHold: boolean, handler?: Function): void {
  keys.forEach(keycode => {
    mp.keys.unbind(keycode, true, handler)
    mp.keys.unbind(keycode, false, handler)
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

export { keyBind, keyUnbind, logbrowser, hex2rgba, colorGradient, getFormattedCurrentTime }