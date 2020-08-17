import React from 'react'
import History from './History'
import { GAMEMENU, GameMenuContext } from '../Reducer'

interface HistoryWrapperProps {
  onRefresh?: (...args: any[]) => void
}
/**
 * Wrapper of history component to handle with state from context
 */
export default function HistoryWrapper({ onRefresh }: HistoryWrapperProps) {
  const { state: {
    [GAMEMENU.HISTORY]: props
  } } = React.useContext(GameMenuContext)

  return <History onRefresh={onRefresh} {...props} />
}