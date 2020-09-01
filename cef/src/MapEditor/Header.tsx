import React from 'react'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import { MapEditorState } from './MapEditor'
import { lang } from '../lib/Language'
import { MSG } from '../messages'

interface Props {
  className: string
  mapName: string
  setState: React.Dispatch<React.SetStateAction<MapEditorState>>
  disabled: boolean
}
/**
 * The header part of map editor's form
 * @param {Props} props 
 */
export default function Header(props: Props) {
  const { className, mapName, setState, disabled } = props

  // handler to edit a name of the map
  const handleEdit = (mapName: string) => setState(state => ({ ...state, mapName }))
  // handler to toggle a focus on the input element
  const toggleFocus = (toggle: boolean) => setState(state => ({ ...state, focus: toggle }))

  return (
    <>
      <Typography className={className} variant="overline" component="h1" gutterBottom>{lang.get(MSG.MAP_EDITOR_HEADER)}</Typography>
      <TextField
        disabled={disabled}
        onChange={(e) => handleEdit(e.target.value)}
        onFocus={() => toggleFocus(true)}
        onBlur={() => toggleFocus(false)}
        id="standard-basic"
        label={lang.get(MSG.MAP_EDITOR_NAME_LABEL)}
        value={mapName}
      />
    </>
  )
}