import { sync } from 'glob'
import { resolve } from 'path'
import { red } from 'colors'
import { logMethod, getJsonFromFileSync, getSrcDir } from '../utils/index'
import { DEBUG } from '../bootstrap'
import { singleton } from 'tsyringe'

/**
 * Config class of the app
 */
@singleton()
class Config extends Object {
  [key: string]: any
  globPatterns: any = {
    "managers": "**/*Manager.js",
    "repositories": "**/*Repo.js",
  }

  constructor(configPath?: string | object) {
    super()
    try {
      this.load(configPath)
      this.resolveGlobPatterns(this.globPatterns)
    } catch (err) {
      console.warn(red('[WARNING]'), "CONFIG NOT LOADED: ", err)
    }
  }

  /**
   * Load config json
   * 
   * @param configPath may be path of config or being json object
   */
  @logMethod(DEBUG)
  load(configPath?: string | object): void {
    const params = typeof configPath === 'string' && getJsonFromFileSync(configPath) || configPath
    Object.entries(params).forEach(([key, value]) => this.set(key, value))
  }

  /**
   * Get config value
   * @param {string} key key of config value
   */
  @logMethod(DEBUG)
  get(key: string): any {
    return this.hasOwnProperty(key) && this[key]
  }

  @logMethod(DEBUG)
  private set(key: string, value: any): void {
    Object.defineProperty(this, key, { value, enumerable: true })
  }

  /**
   * Resolve self glob patterns
   * @param {any} patterns 
   */
  @logMethod(DEBUG)
  private resolveGlobPatterns(patterns: any): void {
    const srcDir: string = getSrcDir()

    /* resolve globPatterns and fill the object by resolved patterns */
    this.globPatterns = Object
      .entries(patterns)
      .reduce((carry: any, currentValue) => {
        const [key, pattern]: [string, any] = currentValue

        carry[key] = sync(resolve(srcDir, pattern))

        return carry
      }, {})
  }
}

export { Config }