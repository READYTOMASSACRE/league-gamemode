import { autoInjectable, singleton } from "tsyringe"
import { ErrorHandler } from "../core/ErrorHandler"
import { event, eventable, command, commandable } from "rage-decorators"
import { Fly } from "../mechanics/Fly"
import { DrawRoutes } from "../mechanics/DrawRoutes"
import { CustomRoute } from "../entities/Route"
import { DialogManager } from "./DialogManager"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"

/**
 * Class to manage game mechanics
 */
@singleton()
@eventable()
@commandable()
@autoInjectable()
class MechanicsManager {
  readonly fly          : Fly = new Fly()
  readonly route        : INTERFACES.Route = new CustomRoute()
  readonly drawRoutes   : DrawRoutes

  constructor(
    readonly errHandler       : ErrorHandler,
    readonly dialogManager    : DialogManager,
    readonly lang             : DummyLanguageManager,
  ) {
    this.drawRoutes         = new DrawRoutes(this.errHandler, this.route)
    this.addPoint           = this.addPoint.bind(this)
    this.clearRoute         = this.clearRoute.bind(this)
    this.drawRoute          = this.drawRoute.bind(this)
    this.stopRoute          = this.stopRoute.bind(this)
  }

  /**
   * Place a point to the radar
   */
  addPoint(): void {
    try {
      if (!this.drawRoutes.isEnabled()) this.drawRoutes.start()

      this.drawRoutes.addPoint(mp.players.local.position)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Remove existing point
   * @param {number} index 
   */
  removePoint(index: number): void {
    try {
      if (!this.drawRoutes.isEnabled()) this.drawRoutes.start()

      this.drawRoutes.removePoint(index)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Place a spawn point to the radar
   * @param {SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS} team 
   */
  addSpawnPoint(team: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS): void {
    try {
      if (!this.drawRoutes.isEnabled()) this.drawRoutes.start()

      this.drawRoutes.addSpawnPoint(team, mp.players.local.position)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Remove existing spawn point
   * @param {SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS} team 
   * @param {number} index 
   */
  removeSpawnPoint(team: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS, index: number): void {
    try {
      if (!this.drawRoutes.isEnabled()) this.drawRoutes.start()

      this.drawRoutes.removeSpawnPoint(team, index)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Clear current route
   */
  clearRoute(): void {
    try {
      this.drawRoutes.clear()
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Draw route
   */
  drawRoute(): void {
    try {
      this.drawRoutes.toggle(true)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Stop drawing route
   */
  startRoute(): void {
    try {
      this.drawRoutes.start()
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Stop drawing route
   */
  stopRoute(): void {
    try {
      this.drawRoutes.stop()
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }
}

export { MechanicsManager }