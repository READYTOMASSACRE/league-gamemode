import { singleton, injectable, container } from "tsyringe"
import { Config } from "../core/Config"
import { statSync } from "fs"
import { resolve } from 'path'
import { createConnection, Connection } from 'typeorm'
import { ErrorHandler } from "../core/ErrorHandler"
import { logMethod } from "../utils"
import { DEBUG } from "../bootstrap"

/**
 * Class to manage database connection
 */
@singleton()
@injectable()
class DbManager implements INTERFACES.Manager {
  constructor(
    readonly config: Config,
    readonly errHandler: ErrorHandler,
  ) {}

  /**
   * Load the database
   */
  @logMethod(DEBUG)
  async load(): Promise<boolean> {
    try {
      const dbConfig = this.config.get('DB')
      if (dbConfig) {
        const connection = await createConnection({
          type: 'mongodb',
          host: dbConfig.HOSTNAME,
          port: dbConfig.PORT,
          username: dbConfig.USERNAME,
          password: dbConfig.PASSWORD,
          database: dbConfig.DATABASE,
          entities: [ this.getEntitiesFolder() ],
          useUnifiedTopology: true,
          synchronize: true,
        })

        container.register(Connection, { useValue: connection })
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }

    return true
  }

  /**
   * Get an absolute path to database
   */
  private getEntitiesFolder(): string {
    const path = resolve(__dirname, "..", "db", "entity")

    statSync(path)

    return path + "/*.js"
  }
}

export { DbManager }