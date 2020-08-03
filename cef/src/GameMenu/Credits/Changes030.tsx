import React from 'react'
import Typography from '@material-ui/core/Typography'

export default function Changes030() {
  return (
    <Typography align="left">
      + Fixed teamselector bug with double binding keys<br />
      + Fixed bug when round timer was not being synced with client/server<br />
      + Added Controls hud element<br />
      + Added Gamemode hud element<br />
      + Added Deathlog hud element<br />
      + Added round pause and pause commands:<br />
      /pause - Pause a round when the round is running<br />
      /unpuase - Unpause a round when the round is running<br />
      + Added change team command:<br />
      /ct [id|nickname] [att|def|spec] - Change a team by player id/nickname, alias /changeteam<br />
      + Added add/remove in/from a round:<br />
      /add [id|nickname] - Add a player to the round<br />
      /remove [id|nickname] - Remove a player from the round<br />
      + Added Gamemenu tabs:<br />
      1. Profile tab - a tab with profile information of player<br />
      2. Players tab - a tab with list of current players (clickable to a player to get a profile)<br />
      3. History tab - a tab with history of matches (at this moment not clickable, soon)<br />
      4. Vote tab - a tab with voting for the map<br />
      5. Top tab - a tab with top of players, sorted by mmr (at this moment no finished, soon)<br />
      6. Credits tab - a tab with information about gamemode author, changelog<br />
      Gamemenu available by F2 button<br />
      + Rework round players' statistic, moved from round players teamId to sharedData<br />
      Breaking changes: round stats now saved with another json object which looks like:<br />
      winner, created_at, ATTACKERS: [], DEFENDERS: []<br />
      + Fixed teamId state in Scoreboard tab<br />
      + Fixed changelang description<br />
      + Fixed error on client when round is running stats has been saving<br />
      + Fixed assist calculation on clientside<br />
      + Fixed bug with checking state of a player (typeof undefined)<br />
      + Added player join/quit notifications in chat<br />
      + Fixed vote bug, when player has voted but at finished time round has not started<br />
  </Typography>
  )
}
