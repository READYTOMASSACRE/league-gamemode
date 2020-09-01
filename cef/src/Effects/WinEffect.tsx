import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { register } from 'rage-rpc'
import { RPC_DIALOG } from '../events'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    animationDuration: '.75s',
    animationFillMode: 'both',
    fontSize: 54,
    color: '#03a9f4',
    textShadow: '0px 0px 15px #03a9f4',
    textDecoration: 'dotted',
    top: '15%',
  }
})

interface WinState {
  way: false | string
  text?: string
  color?: string
}

/**
 * Play a win effect after round is end
 */
export default function WinEffect() {
  const [render, setRender]   = React.useState(false)
  const [state, setState]     = React.useState<WinState>({ way: false, color: '#03a9f4' })
  const classes               = useStyles()

  React.useEffect(() => {
    setRender(true)
    if (!render) {
      register(RPC_DIALOG.CLIENT_NOTIFY_ROUND_END, ([way, params]) => {
        if (['in', 'out'].indexOf(way) !== -1) {
          const { text = "", color = "#fff" } = params || {}
          setState({ way, text, color })
        } else {
          setState(state => ({
            ...state,
            way: false,
          }))
        }
      })
    }
  }, [render, state])

  if (state.way === false) return <></>

  const animation = state.way === 'in' ? 'bounceIn' : 'bounceOut'

  return (
    <Typography
      variant="overline"
      display="block"
      style={{
        color: state.color,
        textShadow: `0px 0px 15px ${state.color}`
      }}
      className={clsx(classes.root, animation)}
    >
      {state.text}
    </Typography>
  )
}