import { logWrapper } from '../utils'
import { DEBUG } from '../bootstrap'
import { magenta } from 'colors'

console.debug = function () { return DEBUG && console.log(...[magenta('[DEBUG]'), ...arguments]) }

/**
 * override ragemp calls if app in debug mode
 */
if (DEBUG) {
  mp.events.add = logWrapper(mp.events.add, 'mp.events')
  mp.events.call = logWrapper(mp.events.call, 'mp.events.call')
  mp.players.call = logWrapper(mp.players.call, 'mp.players.call')
  mp.dummies.new = logWrapper(mp.dummies.new, 'mp.dummies.new')
  mp.events.add("playerJoin", (player: PlayerMp) => player.call = logWrapper(player.call, `player[${player.name}:${player.id}].call`))
}