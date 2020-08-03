import React from 'react'
import Typography from '@material-ui/core/Typography'

export default function Changes020() {
  return (
    <Typography align="left">
      + Changed language system<br />
      + Moved lang from clientside to serverside<br />
      Now available adding new language(s) without build gamemode.<br />
      Just create a file in the lang folder calls e.g. "custom.json" and set up config with the new language "custom"<br />
      + HUD for team selecting (params are editable in config)<br />
      + HUD for vote map (params are editable in config)<br />
      + HUD for Nametag with team color (params are editable in config)<br />
      + HUD for round info panel<br />
      + HUD for any notify messages<br />
      + Text chat<br />
      + Added RCON password in config.json<br />
      You should change rcon password otherwise you will have an error<br />
      + Add groups system [USER, MODERATORS, ADMIN, ROOT]<br />
      Commands:<br />
      /g rcon [password] - grant super privileges<br />
      /g login [password] - login as admin or moderator<br />
      /g addadm [id] [password] - (root only) add a new admin by id<br />
      /g addmod [id] [password] - (root and admin) add a new moderator by id<br />
      /g pwd [password] - change a password for login<br />
      /g user [id] - set a user group for player by id<br />
      + Added admin/root access to commands:<br />
      /roundstart<br />
      /roundend<br />
      + Fixed cmdlist command<br />
      + Refactoring some parts of code in clientside, serverside<br />
      + Added kick command<br />
      /kick [idOrName] [reason] (root and admin and moderator only) - Kick player by reason<br />
      + Added mute command (root and admin and moderator only) - Mute player by reason<br />
      /mute [idOrName] [minutes] [reason]<br />
      + Added unmute command (root and admin and moderator only) - Unmute player<br />
      /unmute [idOrName]<br />
  </Typography>
  )
}
