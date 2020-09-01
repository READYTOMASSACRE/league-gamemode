import React from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Controls, { Control } from '../Common/Controls'
import { MSG } from '../messages'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    top: '80%',
    color: 'white',
    textShadow: '0px 0px 5px rgba(255 255 255 / 50%)',
  },
  nickname: {
    fontSize: 32,
    lineHeight: 1,
  }
})

interface Information {
  id: number
  nickname: string
  kill: number
  death: number
  assist: number
}

interface SpectateCurrentProps {
  open?: boolean
  data?: Information
}

const controls: Control[] = [
  {
    label: MSG.SPECTATE_CONTROL_LABEL,
  },
  {
    input: ['A'],
    label: MSG.SPECTATE_CONTROL_LEFT,
  },
  {
    input: ['D'],
    label: MSG.SPECTATE_CONTROL_RIGHT,
  },
]

/**
 * Spectating for the current player component
 * @param {SpectateCurrentProps} props 
 */
export default function SpectateCurrent(props: SpectateCurrentProps) {
  const classes = useStyles()
  const { open, data } = props

  if (!open || typeof data === 'undefined') return <></>

  return (
    <div className={classes.root}>
      <Typography variant="overline" className={classes.nickname}>{data.nickname}</Typography>
      <Typography>id: {data.id}</Typography>
      <Typography>K:{data.kill} D:{data.death} A:{data.assist}</Typography>
      <Controls controls={controls} />
    </div>
  )
}