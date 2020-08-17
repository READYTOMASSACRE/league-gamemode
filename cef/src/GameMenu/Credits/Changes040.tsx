import React from 'react'
import Typography from '@material-ui/core/Typography'

export default function Changes040() {
  return (
    <Typography align="left">
      + Removed pouchdb from the gamemode because it is not compatitable with linux server<br />
      + Added mongodb database<br />
      + Rewriting repositories and models for new database<br />
      + Added installing instruction to README.md in the github repository<br />
      + Added in-game effects<br />
      Round start notify<br />
      Winning round notify<br />
      Death notify<br />
      Damage notify<br />
      + Added refresh button to history, to player's top<br />
      + Added player's top page in the gamemenu<br />
      + Added detail history page<br />
      + Added pagination to players, history, top players pages in the gamemenu<br />
      + Updated info panel, from this moment shows current score of teams when round is not running<br />
      + Updated weapon dialog design<br />
      + Fix deathlog bug, when a new message erase others messages<br />
      + Refactoring hud manager<br />
      + Refactoring abstract class hud<br />
      + Optimize setInterval calls (reduce huds' count)<br />
      + Fixed isVisible method in nametag hud element (thanks to hromik)<br />
      + Fixed freeze player method<br />
      + Fixed round states (Added prepare state)<br />
      + Fixed saving stats when a player has changed a team<br />
      + Added configurable damage from config<br />
      + Added autologin option<br />
  </Typography>
  )
}
