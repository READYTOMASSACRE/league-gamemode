import React from 'react'
import RefreshIcon from '@material-ui/icons/Refresh'
import { StyledButton } from '../Theme/Dark/ButtonComponents'
import { lang } from '../lib/Language'
import { MSG } from '../messages'
import { ButtonProps as MuiButtonProps } from '@material-ui/core/Button'
import { useThrottle } from '../lib/utils'

interface RefreshButtonProps {
  onClick: (...args: any[]) => void
  ms?: number
}

export default function RefreshButton(props: RefreshButtonProps & Omit<MuiButtonProps, keyof RefreshButtonProps>) {
  const { onClick, ms = 1000, ...other }   = props
  const [ onClickThrottled ] = useThrottle(onClick, ms)

  if (typeof onClickThrottled !== 'function') return <></>

  return (
    <StyledButton onClick={e => onClickThrottled()} {...other}><RefreshIcon />{lang.get(MSG.GAMEMENU_REFRESH_BTN)}</StyledButton>
  )
}