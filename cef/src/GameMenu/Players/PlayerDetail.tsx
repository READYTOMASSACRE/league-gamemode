import React from 'react'
import { callServer } from 'rage-rpc'
import { RPC } from '../../events'
import Profile from '../Profile/Profile'
import { StyledButton } from '../../Theme/Dark/ButtonComponents'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

interface PlayerDetailProps {
  id: number
  onClick: (event: React.MouseEvent, id?: number) => void
}

/**
 * Player detail component
 * @param {PlayerDetailProps} props 
 */
export default function PlayerDetail(props: PlayerDetailProps) {
  const { onClick, id } = props

  const [profileProps, setProps] = React.useState({})
  const [render, setRender] = React.useState(false)

  React.useEffect(() => {
    if (!render) {
      setRender(true)

      callServer(RPC.CEF_GAMEMENU_PROFILE, id)
        .then(props => setProps(props))
    }
  }, [render, id])

  return (
    <React.Fragment>
      <StyledButton startIcon={<ArrowBackIcon />} style={{ margin: 8 }} variant="outlined" onClick={onClick}>Back</StyledButton>
      <Profile {...profileProps} />
    </React.Fragment>
  )
}