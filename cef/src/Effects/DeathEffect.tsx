import React from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Fade from '@material-ui/core/Fade'
import { RPC_DIALOG } from '../events'
import { register } from 'rage-rpc'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    fontSize: '12vmin',
    color: '#f5392a',
    background: 'linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(5,5,5,0.87) 20%, rgba(0,0,0,0.87) 50%, rgba(0,0,0,0.87) 80%, rgba(255,255,255,0) 100%)',
    width: '100%',
    textShadow: '0px 0px 5px #ff1515, 5px 0px 0px #ff000085, -5px 0px 0px #ff00007a',
  }
})

interface DeathEffectState {
  open: boolean
  text?: string
}

export default function DeathEffect() {
  const [render, setRender]   = React.useState(false)
  const [state, setState]     = React.useState<DeathEffectState>({ open: false, text: '' })
  const classes               = useStyles()

  React.useEffect(() => {
    setRender(true)
    if (!render) {
      register(RPC_DIALOG.CLIENT_NOTIFY_DEATH, ([text]) => {
        if (typeof text === 'string') {
          setState({ open: true, text })
        } else {
          setState(state => ({ ...state, open: false }))
        }
      })
    }
  }, [render, state])

  return (
    <Fade in={state.open}>
      <Typography variant="overline" display="block" className={classes.root}>{state.text}</Typography>
    </Fade>
  )
}