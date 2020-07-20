import { resolve } from 'path'
import { readFileSync } from 'fs'
import { magenta } from 'colors'
import { inspect } from 'util'

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max))
}

function getSrcDir(): string {
  return resolve(__dirname, "..")
}

function getProjectDir(): string {
  return resolve(__dirname, "..", "..")
}

function getJsonFromFileSync(path: string): any {
  try {
    return JSON.parse(readFileSync(path).toString())
  } catch (err) {
    console.error('getJsonFromFileSync:', err)
    return null
  }
}

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

function logWrapper(wrappedFunc: Function, objectName?: string) {
  return function (...args: any[]) {
    const params = args.map(a => typeof a === 'function' && `[Function: ${a.name}]`|| inspect(a)).join()
    const result = wrappedFunc.apply(this, arguments)
    const r = JSON.stringify(result)
    const methodName: string = `${objectName || wrappedFunc.constructor.name}::${magenta(wrappedFunc.name)}(${params})`
    console.log(magenta('[DEBUG]'), `${methodName.padding(100)} => ${r}`)

    return result
  }
}

export { getRandomInt, getProjectDir, getSrcDir, getJsonFromFileSync, logWrapper }