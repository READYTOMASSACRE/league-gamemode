import React from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import { StyledTableRow, StyledTableCell } from '../../Theme/Dark/TableComponents'
import { lang } from '../../lib/Language'
import { MSG } from '../../messages'

interface RoundProps {
  result: string
  date: string
  kda: string
}

export interface HistoryProps {
  matches: RoundProps[]
}

/**
 * Round history component
 * @param {HistoryProps} props
 */
export default function History(props: HistoryProps) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <StyledTableCell>{lang.get(MSG.GAMEMENU_HISTORY_TD_RESULT)}</StyledTableCell>
          <StyledTableCell>{lang.get(MSG.GAMEMENU_HISTORY_TD_DATE)}</StyledTableCell>
          <StyledTableCell>{lang.get(MSG.GAMEMENU_HISTORY_TD_KDA)}</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.matches.map((match, index) => (
          <StyledTableRow key={index}>
            <StyledTableCell>{match.result}</StyledTableCell>
            <StyledTableCell>{match.date}</StyledTableCell>
            <StyledTableCell>{match.kda}</StyledTableCell>
          </StyledTableRow>
        ))}
      </TableBody>
    </Table>
  )
}