import React, { MouseEvent } from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import { StyledTableRow, StyledTableCell } from '../../Theme/Dark/TableComponents'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import { lang } from '../../lib/Language'
import { MSG } from '../../messages'
import PlayerDetail from './PlayerDetail'

interface PlayerProps {
  id: number
  name: string
  mmr: number
}

export interface PlayersProps {
  players: PlayerProps[]
}

/**
 * Players table component
 * @param {PlayersProps} props 
 */
export default function Players(props: PlayersProps) {
  const [id, setId] = React.useState<undefined | number>(undefined)
  const handleClick = (_: MouseEvent, id?: number) => setId(id)

  if (typeof id === 'number') return <PlayerDetail id={id} onClick={handleClick} />

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <StyledTableCell>{lang.get(MSG.GAMEMENU_PLAYERS_TD_ID)}</StyledTableCell>
          <StyledTableCell>{lang.get(MSG.GAMEMENU_PLAYERS_TD_NAME)}</StyledTableCell>
          <StyledTableCell>{lang.get(MSG.GAMEMENU_PLAYERS_TD_MMR)}</StyledTableCell>
          <StyledTableCell align="right">{lang.get(MSG.GAMEMENU_PLAYERS_TD_ACTIONS)}</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.players.map((player, index) => (
          <StyledTableRow onClick={event => handleClick(event, player.id)} key={index}>
            <StyledTableCell>{player.id}</StyledTableCell>
            <StyledTableCell>{player.name}</StyledTableCell>
            <StyledTableCell>{player.mmr}</StyledTableCell>
            <StyledTableCell align="right"><AccountBoxIcon /></StyledTableCell>
          </StyledTableRow>
        ))}
      </TableBody>
    </Table>
  )
}