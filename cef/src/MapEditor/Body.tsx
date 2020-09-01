import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import PointList from './PointList'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { MapEditorState } from './MapEditor'
import { lang } from '../lib/Language'
import { MSG } from '../messages'
import { callClient } from 'rage-rpc'
import { RPC_DIALOG } from '../events'
import SpawnVectorList from './SpawnVectorList'

interface Props {
  classes: any
  state: MapEditorState
  setState: React.Dispatch<React.SetStateAction<MapEditorState>>
}

/**
 * The body part of map editor's form
 * 
 * @param {Props} props 
 */
export default function Body(props: Props) {
  const { classes, state: {
    editing,
    path,
    spawn,
    team,
  }, setState } = props

  // handler to change the current team flag
  const changeTeam = (team: 'ATTACKERS' | 'DEFENDERS') => setState(state => ({ ...state, team }))

  // handler to add a new point of map coordinates
  const addPointRequest = (type: 'spawn' | 'coords', team?: string) => {
    if (type === 'coords') {
      callClient(RPC_DIALOG.CEF_MAP_EDITOR_ADD_POINT)
    } else {
      callClient(RPC_DIALOG.CEF_MAP_EDITOR_ADD_SPAWN_POINT, team)
    }
  }

  return (
    <>
      <Typography variant="h6" className={classes.title}>
        {lang.get(MSG.MAP_EDITOR_COORD_LABEL)}
      </Typography>
      <PointList className={classes.list} disabled={!editing} points={path} />
      <Button onClick={() => addPointRequest('coords')} disabled={!editing} variant="outlined" color="primary" size="small" startIcon={<AddIcon />}>{lang.get(MSG.MAP_EDITOR_ADD_POINT)}</Button>
      <Typography variant="h6" className={classes.title}>
        {lang.get(MSG.MAP_EDITOR_SPAWN_LABEL)}
      </Typography>
      <SpawnVectorList className={classes.list} disabled={!editing} points={spawn} />
      <Grid item xs={12}>
        <Select
          labelId="spawn-select-label"
          id="spawn-select"
          value={team}
          disabled={!editing}
          onChange={e => changeTeam(e.target.value as 'ATTACKERS' | 'DEFENDERS')}
        >
          <MenuItem value={"ATTACKERS"}>Attackers</MenuItem>
          <MenuItem value={"DEFENDERS"}>Defenders</MenuItem>
        </Select>
        <Button onClick={() => addPointRequest('spawn', team)} disabled={!editing} size="small" variant="outlined" color="primary" startIcon={<AddIcon />}>{lang.get(MSG.MAP_EDITOR_ADD_SPAWN)}</Button>
      </Grid>
    </>
  )
}