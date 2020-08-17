import React from 'react'
import { makeStyles } from '@material-ui/styles'
import DirectionsRunIconCustom from './DirectionsRunIconCustom'

/**
 * Helper function to build a health gradient
 * @param {number} health - number of heatlh
 */
const healthGradient = (health: number) => {
  return [
    {
      offset: '0%',
      stopColor: '#008b01',
    },
    {
      offset: (100-health) + '%',
      stopColor: '#008b01',
    },
    {
      offset: '0%',
      stopColor: '#57ff59',
    },
  ]
}

// compile css styles
const useStyles = makeStyles({
  root: {
    position: 'absolute',
    width: '100%',
    display: ({ open }: Props) => typeof open === 'undefined' || open ? 'flex' : 'none',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 24,
    textShadow: '2px 0 0 rgba(0, 0, 0, .3), -2px 0 0 rgba(0, 0, 0, .3), 0 2px 0 rgba(0, 0, 0, .3), 0 -2px 0 rgba(0, 0, 0, .3), 1px 1px rgba(0, 0, 0, .3), -1px -1px 0 rgba(0, 0, 0, .3), 1px -1px 0 rgba(0, 0, 0, .3), -1px 1px 0 rgba(0, 0, 0, .3)',
    background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7035189075630253) 10%, rgba(0,0,0,0.7035189075630253) 90%, rgba(0,0,0,0) 100%)',
    '& div': {
      margin: '0 5px',
    },
  },
  team: {
    display: 'inherit',
    alignItems: 'center',
  },
  alive: {
    display: 'inherit',
    maxWidth: 300,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  round: {
    display: 'inherit',
    flexDirection: 'column',
    '& span:first-child': {
      fontSize: 12,
    }
  },
  spanAtt: {
    color: ({ team }: Props) => team.ATTACKERS.color,
    margin: 5,
  },
  spanDef: {
    color: ({ team }: Props) => team.DEFENDERS.color,
    margin: 5,
  },
})

interface RoundTimerProps {
  className   : string
  time        : string
  arena       : string
}
// component props
interface Props {
  open?: boolean
  round?: {
    time    : string
    arena   : string
  }
  team: {
    [key in Exclude<SHARED.TEAMS, SHARED.TEAMS.SPECTATORS>]: {
      name    : string
      color   : string
      players : number[]
      score   : number
    }
  }
}

function RoundTimer(props: RoundTimerProps) {
  const { time, arena, className } = props
  return (
    <div className={className}>
      <span>{arena}</span>
      <span>{time}</span>
    </div>
  )
}

/**
 * Top round panel
 * @param props - component params
 */
export default function InfoPanel(props: Props) {
  const classes = useStyles(props)

  let centerPanel: any = <span>-</span>
  if (props.round) centerPanel = <RoundTimer className={classes.round} {...props.round} />

  return (
    <div className={classes.root}>
      <div className={classes.team}>
        <span className={classes.spanAtt}>{props.team.ATTACKERS.name}</span>
        <span className={classes.spanAtt}>{props.team.ATTACKERS.score}</span>
        <span className={classes.alive}>
          {props.team.ATTACKERS.players.map((health, index) => (
            <DirectionsRunIconCustom key={index} fontSize="inherit" gradientid={'att'+index} className="Infopanel__player" healthgradient={healthGradient(health)} />
          ))}
        </span>
      </div>
      {centerPanel}
      <div className={classes.team}>
        <span className={classes.alive}>
          {props.team.DEFENDERS.players.map((health, index) => (
            <DirectionsRunIconCustom key={index} fontSize="inherit" gradientid={'deff'+index} className="Infopanel__player" healthgradient={healthGradient(health)} />
          ))}
        </span>
        <span className={classes.spanDef}>{props.team.DEFENDERS.score}</span>
        <span className={classes.spanDef}>{props.team.DEFENDERS.name}</span>
      </div>
    </div>
  )
}