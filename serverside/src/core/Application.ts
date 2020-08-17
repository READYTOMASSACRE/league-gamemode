import { DEBUG } from '../bootstrap'
import { Config } from './Config'
import { logMethod } from '../utils/decorators'
import { container, singleton, injectable, inject } from 'tsyringe'
import { DbManager } from '../managers/DbManager'
import { IsNotExistsError, ServerError } from '../errors/LogErrors'
import { ErrorHandler } from './ErrorHandler'
import { green, blue, bold, red } from 'colors'

/**
 * Core class of an application
 */
@singleton()
@injectable()
class Application {
  static readonly RECOMMENDED_PLAYERS = 32
  static readonly GAMEMODE = 'League'
  static readonly VERSION  = '0.4.0'

  managers: Map<any, INTERFACES.Manager> = new Map<any, INTERFACES.Manager>()
  repositories: Map<any, any> = new Map()

  constructor(
    @inject(Config) private config: Config,
    @inject(ErrorHandler) private errHandler: ErrorHandler,
  ) {}

  /**
   * Start the app
   */
  @logMethod(DEBUG)
  async start(): Promise<boolean> {
    try {
      this.prepare()

      await this.loadDatabase()
      this.loadManagers()

      this.printSuccess()
    } catch (err) {
      const handled = this.errHandler.handle(err)
      if (!handled) throw err

      return false
    }

    return true
  }

  /**
   * Prepare the app starting
   */
  private prepare(): void {
    if (mp.config.gamemode !== Application.GAMEMODE) {
      mp.config.gamemode = Application.GAMEMODE
    }
    const rcon = this.config.get("RCON")
    if (
      typeof rcon !== 'string'
      || !rcon.length
      || rcon === 'changeme'
    ) {
      throw new ServerError("Invalid RCON password in config.json. Please make sure the RCON is not empty and not equal 'changeme'.")
    }
  }

  /**
   * Load all managers
   */
  @logMethod(DEBUG)
  private loadManagers(): boolean {
    const managers: string[] = this.config.globPatterns.managers

    if (managers) {
      managers.forEach(manager => {
        const requiredManagers = require(manager)

        for (let ctor in requiredManagers) {
          if (typeof requiredManagers[ctor] == 'function') {
            const manager: INTERFACES.Manager = container.resolve(requiredManagers[ctor])
            this.managers.set(requiredManagers[ctor], manager)

            if (manager.load) manager.load()
            break
          }
        }
      })
    }

    return true
  }

  /**
   * Load database
   */
  private async loadDatabase(): Promise<boolean> {
    const managers: string[] = this.config.globPatterns.managers
    const managerIndex = managers.findIndex((managerPath: string) => managerPath.match(/DbManager/))
    
    if (managerIndex === -1) throw new IsNotExistsError("Database manager is not exists")
    const requiredManager = require(managers[managerIndex])

    for (let ctor in requiredManager) {
      if (typeof requiredManager[ctor] == 'function') {

        const dbManager: DbManager = container.resolve(requiredManager[ctor])
        this.managers.set(requiredManager[ctor], dbManager)

        await dbManager.load()
        break
      }
    }

    this.config.globPatterns.managers.splice(managerIndex, 1)
    return true
  }

  /**
   * Return config
   */
  getConfig(): Config {
    return this.config
  }

  /**
   * Get a manager
   * @note recommended using dependency injection instead of this method
   * 
   * @param Manager - class of a manager
   */
  getManager<TManager extends INTERFACES.Manager>(Manager: TManager | any): TManager {
    return this.managers.get(Manager) as TManager
  }

  /**
   * Prints that the app has started with/withour errors, warnings
   */
  private printSuccess(): void {
    const slots = mp.config.maxplayers

    if (slots > Application.RECOMMENDED_PLAYERS) {
      console.info(
        red('[WARNING]'),
        `Server slots are more (${red(slots.toString())}) then recommended (${red(Application.RECOMMENDED_PLAYERS.toString())}).`,
        'It may create gamemode issues.'
      )
    }

    console.info(this.gamemodeText, `version is ${blue(Application.VERSION)}.`)
    console.info(this.gamemodeText, `Application has started ${green('successfuly')}.`)
  }

  /**
   * Get a name of the gamemode
   */
  get gamemodeText(): string {
    return blue(`[${bold(Application.GAMEMODE)}]`)
  }
}

export { Application }