import React from 'react'
import Typography from '@material-ui/core/Typography'

export default function Changes050() {
  return (
    <Typography align="left">
      + Added map editor<br />
      Thanks to hromik for supporting with gameplay camera change player's handle<br />
      <br />
      /me (or /mapeditor) [on|off] - enable/disable map editor<br />
      You should be an administrator or have root access<br />
      Also round should be is not running<br />
      <br />
      Map editor gives opportunity to create maps on the server<br />
      After saving a new map you can easily start it immediately without restarting server.<br />
      Editor controls inforomation:<br />
      2 - Start draw a new map<br />
      3 - Reset all progress of draw<br />
      4 - Save a new map<br />
      5 - Show/hide a map editor<br />
      <br />
      E - Add a map point (To make a polygon of map zone)<br />
      R - Add a spawn point (To make spawn points for teams: attackers, defenders)<br />
      <br />
      X - Remove a map point<br />
      C - Remove a spawn point<br />
      <br />
      F - Toggle current value of team (To attach a spawn point to the concrete team)<br />
      <br />
      F5 - Toggle fly mode<br />
      F7 - Toggle a cursor<br />
      <br />
      Also all functions can easily be done with form<br />
      After saving a new map - file maps.json will has been edited, also you can edit it by hands (Refresh after editing by hands is not ready yet)<br />
      + Added spectating mode<br />
      Still in develpoment mode because of unknown issues that I will try to find<br />
      /spec (or /spectate) [id|player name|off] - toggling spectate, off means to disable spectating mode<br />
      Known issues: After toggling off spectate mode, player's dimension isn't updating with lobby dimension (will be fixed in the next release)<br />
      In the spectate mode added current spectating player's information<br />
      Added current players spectating list<br />
      + Added map refreshing function (To avoid restarting server for updating maps, in the future will be access to call it directly by command or admin form)<br />
      + Updated round panel information (At this moment during the whole round time all players see round timers even if players connected after the server had started)<br />
      + Added a new game player status: SPECTATE<br />
      + Rewrited MMR/EXP system after the round ends (At this moment it calculates new values depends on players count in the their teams)<br />
      + Updated control HUDs - changed from mp.game.graphics.drawText to CEF<br />
      + Updated Nametag HUD - added ID above the nickname<br />
      + Added circle camera when round is starting<br />
      + Fixed Fly mechanics, there was a bug when fly camera was attached to the wrong camera<br />
      + Added new control: F7 - toggling cursor<br />
      + Refactoring Round lifecycle events on clientside<br />
      + Refactoring Round lifecycle evnets on serverside<br />
      Still testing, might has issues<br />
      + Fixed round statistic update (Added throttled functions to avoid spam events to serverside)<br />
      + Fixed shotgun pellets damage (There was invoked too many times which made a bug with kill)<br />
      + Fixed duplicate damage notify<br />
      + Fixed keyBind/keyUnbind methods (There was a bug which crashed client)<br />
      + Fixed debug error messages to players (Now it's hidden)<br />
  </Typography>
  )
}
