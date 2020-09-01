import React from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import { callClient } from 'rage-rpc'
import { RPC_DIALOG } from '../events'
import { Point } from './MapEditor'

interface Props {
  className: string
  disabled: boolean
  points: Point[]
}
/**
 * Point list component
 * @param {Props} props 
 */
export default function PointList(props: Props) {
  const { className, disabled, points } = props

  if (!points.length) return <></>
  
  const removePointRequest = (index: number) => {
    callClient(RPC_DIALOG.CEF_MAP_EDITOR_REMOVE_POINT, index)
  }

  return (
    <List className={className}>
      {points.map((point, index) => (
        <ListItem key={index} dense disabled={disabled}>
          <ListItemText primary={point.name} secondary={JSON.stringify(point.coord)} />
          <ListItemSecondaryAction>
            <IconButton onClick={() => removePointRequest(index)} disabled={disabled} edge="end" aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  )
}