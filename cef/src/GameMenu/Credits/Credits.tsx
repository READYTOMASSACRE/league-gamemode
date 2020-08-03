import React from 'react'
import Typography from '@material-ui/core/Typography'
import Changelog from './Changelog';

export interface CreditsProps {
  gamemode: string
  version: string
}
/**
 * Credits component
 */
export default function Credits(props: CreditsProps) {
  const { gamemode, version } = props

  return (
    <React.Fragment>
      <Typography variant="h4">
        {gamemode}, {version}
      </Typography>
        <Typography variant="overline">TDM gamemode for clan matches</Typography>
        <Typography variant="overline" display="block">Author: <strong>ragecacao (readytomassacre)</strong></Typography>
        <Typography variant="caption" display="block" gutterBottom><u><strong>https://discord.gg/pwTZ6SS</strong></u></Typography>
      <Changelog />
    </React.Fragment>
  )
}