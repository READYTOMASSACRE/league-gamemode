import { singleton, injectable, inject, container } from "tsyringe"
import { Config } from "../core/Config"
import * as pouchdb from 'pouchdb'
import * as pouchdbUpsert from 'pouchdb-upsert'
import { statSync } from "fs"
import { resolve } from 'path'

/**
 * Class to manage database connection
 */
@singleton()
@injectable()
class DbManager implements INTERFACES.Manager {
  static readonly REPLICA_ENABLE    = false
  static readonly REPLICA_URL       = 'http://localhost:5984/'
  static readonly OPTIONS = {
    auto_compaction                 : true,
    revs_limit                      : 3,
    adapter                         : 'leveldb',
  }

  private dbPath                    : string

  private playersDb?                : PouchDB.Database
  private roundsDb?                 : PouchDB.Database

  constructor(@inject(Config) private readonly config: Config) {
    this.dbPath = this.config.get("DB_PATH")
  }

  /**
   * Load the database
   */
  load(): boolean {
    pouchdb.plugin(pouchdbUpsert)
    this.playersDb = new pouchdb(this.getAbsolutePath() + '\\' + ENUMS.COLLECTIONS.PLAYERS, DbManager.OPTIONS)
    this.roundsDb  = new pouchdb(this.getAbsolutePath() + '\\' + ENUMS.COLLECTIONS.ROUNDS, DbManager.OPTIONS)

    if (DbManager.REPLICA_ENABLE) this.setReplica()
    
    container.register(ENUMS.COLLECTIONS.PLAYERS, { useValue: this.playersDb })
    container.register(ENUMS.COLLECTIONS.ROUNDS, { useValue: this.roundsDb })

    return true
  }

  /**
   * Set the replica to REPLICA_URL
   */
  setReplica(): void {
    if (this.playersDb) {
      this.playersDb.replicate.to(DbManager.REPLICA_URL + ENUMS.COLLECTIONS.PLAYERS, { live: true })
    }
    if (this.roundsDb) {
      this.roundsDb.replicate.to(DbManager.REPLICA_URL + ENUMS.COLLECTIONS.ROUNDS, { live: true })
    }
  }

  /**
   * Get an absolute path to database
   */
  private getAbsolutePath(): string {
    const path = resolve(this.dbPath)

    statSync(path)

    return path
  }
}

export { DbManager }