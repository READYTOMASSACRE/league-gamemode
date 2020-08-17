import React from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import { StyledTableCell } from '../../Theme/Dark/TableComponents'
import { lang } from '../../lib/Language'
import { MSG } from '../../messages'

export default function HistoryDetail(props: any) {
  const { ATTACKERS, DEFENDERS, winner, created_at } = props

  const attKills = ATTACKERS.players.reduce((acc: number, player: any) => acc + player.kill, 0)
  const defKills = DEFENDERS.players.reduce((acc: number, player: any) => acc + player.kill, 0)

  let spanVictoryKill = <></>
  if (winner === 'ATTACKERS') {
    spanVictoryKill = <span>{attKills} - {defKills}</span>
  } else {
    spanVictoryKill = <span>{defKills} - {attKills}</span>
  }

  const outOfPlayers = (
    <TableRow>
      <StyledTableCell align="center" colSpan={4}>{lang.get(MSG.GAMEMENU_HISTORY_DETAIL_EMPTY)}</StyledTableCell>
    </TableRow>
  )
  const attackersRow = ATTACKERS.players.length
    ? ATTACKERS.players.map((player: any, index: number) => (
      <TableRow key={index}>
        <StyledTableCell>{player.name}</StyledTableCell>
        <StyledTableCell>{player.kill}/{player.death}/{player.assist}</StyledTableCell>
      </TableRow>
    ))
    : outOfPlayers

  const defendersRow = DEFENDERS.players.length
    ? DEFENDERS.players.map((player: any, index: number) => (
      <TableRow key={index}>
        <StyledTableCell>{player.name}</StyledTableCell>
        <StyledTableCell>{player.kill}/{player.death}/{player.assist}</StyledTableCell>
      </TableRow>
    ))
    : outOfPlayers

  const winnerSpan = winner
      ? <span>{lang.get(MSG.GAMEMENU_HISTORY_DETAIL_VICTORY, props[winner].name)}</span>
      : <span>Draw</span>
  return (
    <React.Fragment>
      <br/>
      <Typography style={{ fontSize: 32, color: props[winner].color }} variant="overline">{winnerSpan}</Typography><br/>
      <Typography variant="overline">{spanVictoryKill}, {created_at}</Typography><br/>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{lang.get(MSG.GAMEMENU_HISTORY_TD_NAME)}</TableCell>
            <TableCell>{lang.get(MSG.GAMEMENU_HISTORY_TD_KDA)}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <StyledTableCell
              style={{
                backgroundColor: 'rgba(31 31 31 / 54%)',
                color: props['ATTACKERS'].color
              }}
              align={'center'} colSpan={4}
            >
              {props['ATTACKERS'].name} ({attKills})
            </StyledTableCell>
          </TableRow>
          {attackersRow}
          <TableRow>
            <StyledTableCell
              style={{
                backgroundColor: 'rgba(31 31 31 / 54%)',
                color: props['DEFENDERS'].color
              }}
              align={'center'}
              colSpan={4}
            >
              {props['DEFENDERS'].name} ({defKills})
            </StyledTableCell>
          </TableRow>
          {defendersRow}
        </TableBody>
      </Table>
    </React.Fragment>
  )
}