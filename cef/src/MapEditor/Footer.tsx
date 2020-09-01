import React from 'react'
import Grid from '@material-ui/core/Grid'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import CancelIcon from '@material-ui/icons/Cancel'
import { MapEditorState } from './MapEditor'
import { lang } from '../lib/Language'
import { MSG } from '../messages'
import { callClient } from 'rage-rpc'
import { RPC_DIALOG } from '../events'
import Controls, { Control } from '../Common/Controls'

interface Props {
  disabled: boolean
  setState: React.Dispatch<React.SetStateAction<MapEditorState>>
}

/**
 * The footer part of map editor's form
 * @param props 
 */
export default function Footer(props: Props) {
  const { disabled, setState } = props

  // handler for reseting the current state of form
  const resetRequest = () => callClient(RPC_DIALOG.CEF_MAP_EDITOR_RESET)
  // handler for saving a new map
  const saveRequest = () => callClient(RPC_DIALOG.CEF_MAP_EDITOR_SAVE)
  // handler to change editing state (Start btn)
  const toggleEdit = () => setState(state => ({ ...state, editing: true }))

  const controls: Control[] = [
    {
      input: ['E'],
      label: 'Add point',
      disabled,
    },
    {
      input: ['X'],
      label: 'Remove point',
      disabled,
    },
    {
      input: ['R'],
      label: 'Add spawn point',
      disabled,
    },
    {
      input: ['C'],
      label: 'Remove spawn point',
      disabled,
    },
    {
      input: ['F'],
      label: 'Toggle team',
      disabled,
    },
    {
      input: ['2'],
      label: 'Start',
      disabled: !disabled,
    },
    {
      input: ['3'],
      label: 'Reset',
      disabled,
    },
    {
      input: ['4'],
      label: 'Save',
      disabled,
    },
    {
      input: ['5'],
      label: 'Show/Hide',
    },
    {
      input: ['F5'],
      label: 'Fly on/off',
    },
    {
      input: ['F7'],
      label: 'Cursor',
    },
  ]

  return (
    <>
      <Grid item xs={12}>
        <ButtonGroup size="small" aria-label="outlined primary button group">
          <Button onClick={() => toggleEdit()} disabled={!disabled} color="primary" startIcon={<PlayArrowIcon />}>{lang.get(MSG.MAP_EDITOR_START)}</Button>
          <Button onClick={() => resetRequest()} disabled={disabled} color="secondary" startIcon={<CancelIcon />}>{lang.get(MSG.MAP_EDITOR_RESET)}</Button>
          <Button onClick={() => saveRequest()} disabled={disabled} color="primary" startIcon={<SaveIcon />}>{lang.get(MSG.MAP_EDITOR_SAVE)}</Button>
        </ButtonGroup>
      </Grid>
      <Grid item xs={12} style={{ marginTop: 10 }}>
        <Controls controls={controls} />
      </Grid>
    </>
  )
}