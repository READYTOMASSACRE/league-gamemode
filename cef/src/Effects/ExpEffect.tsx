import React, { MouseEvent } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import clsx from 'clsx'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    animationDuration: '.3s',
    animationFillMode: 'both',
    textShadow: '0px 0px 5px rgba(255,190,0,1)',
    color: 'rgba(255,190,0,1)',
  }
})

interface ExpEffect {
  message?: string
  on?: number
}

const Text = (props: ExpEffect) => {
  const classes       = useStyles()
  const exp           = props.message || "+120 xp"
  const rootClass     = clsx(classes.root, props.on ? 'bounceIn' : 'bounceOut')

  return <Typography className={rootClass}>{exp}</Typography>
}

export default function ExpEffect(props: ExpEffect) {
  const [on, set]     = React.useState(0)
  const handleClick   = (e: MouseEvent) => set(on => +!on)

  return (
    <Text key={on} {...{...props, on}}/>
  )
}