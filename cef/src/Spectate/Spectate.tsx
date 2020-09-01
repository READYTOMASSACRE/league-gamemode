import React from 'react'
import SpectateCurrent from './SpectateCurrent'
import SpectateViewers from './SpectateViewers'
import { register } from 'rage-rpc'
import { RPC_DIALOG } from '../events'

const action = (state: any, field: string, value: any) => ({
  ...state,
  [field]: value
})

/**
 * Spectate hud component
 */
export default function Spectate() {
  const [render, setRender] = React.useState(false)
  const [state, setState] = React.useState({
    currentOpen: false,
    currentData: undefined,
    viewersOpen: false,
    viewersData: undefined,
  })

  // register side effects (toggle current/viewers hud, updating current/viewers data)
  React.useEffect(() => {
    setRender(true)
    if (!render) {

      register(RPC_DIALOG.CLIENT_SPECTATE_CURRENT_TOGGLE, ([ toggle ]) => 
        setState(state => action(state, 'currentOpen', toggle))
      )
      
      register(RPC_DIALOG.CLIENT_SPECTATE_VIEWERS_TOGGLE, ([ toggle ]) => 
        setState(state => action(state, 'viewersOpen', toggle))
      )

      register(RPC_DIALOG.CLIENT_SPECTATE_CURRENT, ([ data ]) => {
        setState(state => action(state, 'currentData', data))
      })

      register(RPC_DIALOG.CLIENT_SPECTATE_VIEWERS, ([ data ]) => {
        setState(state => action(state, 'viewersData', data))
      })
    }
  }, [render, state])

  const { currentOpen, currentData, viewersOpen, viewersData } = state

  return (
    <>
      <SpectateCurrent open={currentOpen} data={currentData} />
      <SpectateViewers open={viewersOpen} data={viewersData}/>
    </>
  )
}