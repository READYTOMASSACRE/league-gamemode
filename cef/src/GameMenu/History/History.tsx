import React, { MouseEvent } from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TablePagination from '@material-ui/core/TablePagination'
import TableContainer from '@material-ui/core/TableContainer'
import { StyledTableRow, StyledTableCell } from '../../Theme/Dark/TableComponents'
import { lang } from '../../lib/Language'
import { MSG } from '../../messages'
import HistoryDetailWrapper from './HistoryDetailWrapper'
import RefreshButton from '../../Common/RefreshButton'

interface RoundProps {
  id: string
  result: string
  date: string
  kda: string
}

export interface HistoryProps {
  matches: RoundProps[]
  onRefresh?: (...args: any[]) => void
}

/**
 * Round history component
 * @param {HistoryProps} props
 */
export default function History(props: HistoryProps) {
  const rowsPerPage       = 15
  const [page, setPage]   = React.useState(0)
  const [id, setId]       = React.useState<undefined | string>(undefined)
  const handleChangePage  = (event: unknown, newPage: number) => setPage(newPage)
  const handleClick       = (_: MouseEvent, id?: string) => setId(id)

  if (typeof id === 'string') return <HistoryDetailWrapper id={id} onClick={handleClick} />

  const matches = props.matches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const { onRefresh } = props

  return (
    <>
      {onRefresh && <RefreshButton onClick={onRefresh} />}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell>{lang.get(MSG.GAMEMENU_HISTORY_TD_RESULT)}</StyledTableCell>
              <StyledTableCell>{lang.get(MSG.GAMEMENU_HISTORY_TD_DATE)}</StyledTableCell>
              <StyledTableCell>{lang.get(MSG.GAMEMENU_HISTORY_TD_KDA)}</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((match, index) => (
              <StyledTableRow onClick={event => handleClick(event, match.id)} key={index}>
                <StyledTableCell>{match.result}</StyledTableCell>
                <StyledTableCell>{match.date}</StyledTableCell>
                <StyledTableCell>{match.kda}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        style={{ color: 'white' }}
        rowsPerPageOptions={[18]}
        component="div"
        count={props.matches.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
      />
    </>
  )
}