import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Header from './Header'
import Body from './Body'
import Footer from './Footer'
import { register, callClient } from 'rage-rpc'
import { RPC_DIALOG } from '../events'

const useStyles = makeStyles({
  root: {
    borderTop: '10px solid black',
    position: 'absolute',
    right: '5vmin',
    flexGrow: 1,
    padding: 15,
    maxWidth: 460,
    background: 'rgba(255 255 255 / 75%)',
    '&:focus': {
      outline: 'none',
    },
  },
  header: {
    fontWeight: 600,
    fontSize: 24,
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: 'crimson',
  },
  title: {
    marginTop: 15,
  },
  list: {
    maxHeight: 100,
    overflow: 'auto',
  }
})

export interface Point {
  name: string
  coord: any
}
export type SpawnVector = {
  'ATTACKERS': Point[]
  'DEFENDERS': Point[]
}

export interface MapEditorState {
  open: boolean
  editing: boolean
  path: Point[]
  spawn: SpawnVector
  team: 'ATTACKERS' | 'DEFENDERS'
  mapName: string
  focus: boolean
}

export const initialMapEditorState: MapEditorState = {
  open: false,
  editing: false,
  path: [],
  spawn: {
    'ATTACKERS': [],
    'DEFENDERS': [],
  },
  team: 'ATTACKERS',
  mapName: '',
  focus: false,
}

/**
 * The map editor form
 */
export default function MapEditor() {
  const [render, setRender] = React.useState(false)
  const [state, setState] = React.useState<MapEditorState>(initialMapEditorState)

  const classes = useStyles()

  // register side effects (toggling event and state update event)
  React.useEffect(() => {
    if (!render) {
      setRender(true)
      register(RPC_DIALOG.CLIENT_MAP_EDITOR_TOGGLE, ([ toggle ]) => {
        setState(state => ({ ...state, open: toggle }))
      })

      register(RPC_DIALOG.CLIENT_MAP_EDITOR_UPDATE, ([ newState ]) => {
        setState(state => ({ ...state, ...newState }))
      })
    }
  }, [render, state])

  // register side effects (update state on the client)
  React.useEffect(() => {
    callClient(RPC_DIALOG.CEF_MAP_EDITOR_UPDATE_CLIENT, state)
  }, [state])

  if (state.open === false) return <></>

  return (
    <Paper className={classes.root} tabIndex={0}>
      <Grid item xs={12}>
        <Header disabled={!state.editing} className={classes.header} mapName={state.mapName} setState={setState} />
        <Body classes={classes} state={state} setState={setState} />
        <Footer disabled={!state.editing} setState={setState} />
      </Grid>
    </Paper>
  )
}