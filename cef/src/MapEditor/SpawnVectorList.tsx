import React from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import { callClient } from 'rage-rpc'
import { RPC_DIALOG } from '../events'
import { SpawnVector } from './MapEditor'

interface Props {
  className: string
  disabled: boolean
  points: SpawnVector
}
/**
 * SpawnVector list component
 * @param {Props} props 
 */
export default function SpawnVectorList(props: Props) {
  const { className, disabled, points: {
    ATTACKERS,
    DEFENDERS,
  } } = props

  if (!ATTACKERS.length && !DEFENDERS.length) return <></>
  
  const removePointRequest = (team: 'ATTACKERS' | 'DEFENDERS', index: number) => {
    callClient(RPC_DIALOG.CEF_MAP_EDITOR_REMOVE_SPAWN_POINT, [team, index])
  }

  return (
    <List className={className}>
      {ATTACKERS.map((point, index) => (
        <ListItem key={index} dense disabled={disabled}>
          <ListItemText primary={point.name} secondary={`ATTACKERS: ${JSON.stringify(point.coord)}`} />
          <ListItemSecondaryAction>
            <IconButton onClick={() => removePointRequest('ATTACKERS', index)} disabled={disabled} edge="end" aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
      {DEFENDERS.map((point, index) => (
        <ListItem key={index} dense disabled={disabled}>
          <ListItemText primary={point.name} secondary={`DEFENDERS: ${JSON.stringify(point.coord)}`} />
          <ListItemSecondaryAction>
            <IconButton onClick={() => removePointRequest('DEFENDERS', index)} disabled={disabled} edge="end" aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  )
}