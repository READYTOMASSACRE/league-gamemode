import React from 'react'
import { callServer } from 'rage-rpc'
import { RPC } from '../../events'
import { StyledButton } from '../../Theme/Dark/ButtonComponents'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import HistoryDetail from './HistoryDetail'

interface HistoryDetailProps {
  id: string
  onClick: (event: React.MouseEvent, id?: string) => void
}

/**
 * Player detail component
 * @param {HistoryDetailProps} props 
 */
export default function HistoryDetailWrapper(props: HistoryDetailProps) {
  const { onClick, id } = props

  const [matchProps, setProps] = React.useState<any>({})
  const [render, setRender] = React.useState(false)

  React.useEffect(() => {
    if (!render) {
      setRender(true)

      callServer(RPC.CEF_GAMEMENU_HISTORY, id)
        .then(props => setProps(props))
    }
  }, [render, id])

  const { ATTACKERS, DEFENDERS } = matchProps

  let content = <></>
  if (
    !ATTACKERS
    || !DEFENDERS
    || !Array.isArray(ATTACKERS.players)
    || !Array.isArray(DEFENDERS.players)
  ) {
    content = <span>Data corrupted.</span>
  } else {
    content = <HistoryDetail {...matchProps} />
  }

  return (
    <React.Fragment>
      <StyledButton startIcon={<ArrowBackIcon />} style={{ margin: 8 }} variant="outlined" onClick={onClick}>Back</StyledButton>
      {content}
    </React.Fragment>
  )
}