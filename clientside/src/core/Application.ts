import * as Managers from '../managers'
import { container } from "tsyringe"

/**
 * Core class of an application
 */
export class Application {
  private managers: INTERFACES.Manager[] = []
  /**
   * Start the application
   */
  start(): void {
    this.loadManagers()
  }
  /**
   * Load all managers by factory config params
   */
  loadManagers(): void {
    Object.entries(Managers).forEach(([packageName, packageItem]: [string, any]) => {
      if (
        packageName.match(/manager/gi)
        && typeof packageItem === 'function'
      ) {
        this.managers.push(container.resolve(packageItem) as INTERFACES.Manager)
      }
    })

    this.managers.forEach(manager => {
      if (manager.load) manager.load()
    })
  }

  /**
   * Get a manager
   * @note recommended using dependency injection instead of this method
   * 
   * @param Manager - class of a manager
   */
  getManager<TManager extends INTERFACES.Manager>(Manager: TManager | any): TManager {
    return this.managers.find(manager => manager instanceof Manager) as TManager
  }
}