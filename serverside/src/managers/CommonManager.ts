import { getProjectDir } from "../utils"
import { command, commandable } from "rage-decorators"
import { resolve } from "path"
import { readFileSync, writeFileSync } from "fs"
import { singleton } from "tsyringe"

/**
 * Manager to register and store any common cmds
 */
@singleton()
@commandable()
class CommonManager {

  /**
   * Command
   * 
   * Getting the player's pos
   * @note Command will be deleted in the future
   * @param {PlayerMp} player 
   */
  @command('pos')
  sendPlayerPos(player: PlayerMp): void {
    const {x, y, z} = player.position

    player.notify(`x:${x} y:${y} z:${z}`)
  }

  /**
   * Command
   * 
   * Save the player's position
   * @note Command will be deleted in the future
   * @param {PlayerMp}
   * @param {string} cmdDesc
   * @param {string} pointName - (optional) name of the point
   */
  @command('savepos', { desc: SHARED.MSG.CMD_SAVE_POS })
  savePlayerPos(player: PlayerMp, _: string, pointName?: string): void {
    const {x, y, z} = player.position

    try {
      const path = resolve(getProjectDir(), 'assets', 'savepositions.json')
  
      const positions: any[] = JSON.parse(readFileSync(path).toString())
      positions.push({ point: [x, y, z], name: pointName || ""})
     
      writeFileSync(path, JSON.stringify(positions))

      player.notify(`${pointName || "Point"} saved!`)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Command
   * 
   * Make the suicide
   * @param {PlayerMp}
   */
  @command('kill')
  kill(player: PlayerMp): void {
    player.health = 0
  }
}

export { CommonManager }