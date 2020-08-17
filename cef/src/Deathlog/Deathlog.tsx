import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Fade from '@material-ui/core/Fade'
import Collapse from '@material-ui/core/Collapse'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 3,
    height: 25,
    backgroundColor: 'rgba(0 0 0 / 60%)',
    border: '1px solid rgba(0 0 0 / 15%)',
    margin: 5,
  },
  img: {
    maxHeight: 24,
    margin: 5,
    filter: 'brightness(0) invert(1) drop-shadow(1px 1px 1px rgba(0 0 0 / 25%))',
  },
})

export interface DeathlogProps {
  checked: boolean
  killer: {
    name: string
    color: string
  }
  victim: {
    name: string
    color: string
  }
  weapon: string
}

/**
 * Deathlog
 */
export default function Deathlog(props: DeathlogProps) {
  const { checked, killer, victim, weapon } = props

  const classes = useStyles()
  const src = `/assets/weapons/${weapon}.webp`

  return (
    <Collapse in={checked}>
      <Fade in={checked}>
        <div className={classes.root}>
          <Typography style={{color: killer.color }}>{killer.name}</Typography>
          <img className={classes.img} src={src} alt="" />
          <Typography style={{color: victim.color }}>{victim.name}</Typography>
        </div>
      </Fade>
    </Collapse>
  )
}