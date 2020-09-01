import React from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { lang } from '../lib/Language'
import { MSG } from '../messages'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    left: '2vmin',
    top: '60%',
    textAlign: 'left',
    color: 'white',
    textShadow: '0px 0px 5px rgba(255 255 255 / 50%)',
  },
  spectate: {
    display: 'flex',
    flexDirection: 'column',
    height: 100,
    flexWrap: 'wrap',
    '& p': {
      marginRight: 5,
    }
  }
})
interface Information {
  players: string[]
}

interface SpectateViewersProps {
  open?: boolean
  data?: Information
}

/**
 * Spectate viewers hud element
 */
export default function SpectateViewers(props: SpectateViewersProps) {
  const classes = useStyles()
  const { open, data } = props

  if (
    !open
    || typeof data === 'undefined'
    || !Array.isArray(data.players)
    || !data.players.length
  ) {
    return <></>
  }

  return (
    <div className={classes.root}>
      <Typography>{lang.get(MSG.SPECTATE_CURRENT_TEXT)}</Typography>
      <div className={classes.spectate}>
        {data.players.map((nickname, index) => (
          <Typography key={index}>{nickname}</Typography>
        ))}
      </div>
    </div>
  )
}