import React from 'react'
import { lang } from '../../lib/Language'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import { StyledTableRow, StyledTableCell } from '../../Theme/Dark/TableComponents'
import { MSG } from '../../messages'

export interface ProfileProps {
  [key: string]: string | number
}

/**
 * Profile table component
 * @param {ProfileProps} props 
 */
export default function Profile(props: ProfileProps) {
  const arrayProps = Object.entries(props)
  const name = props.name || ""

  return (
    <React.Fragment>
      <strong>{lang.get(MSG.GAMEMENU_PROFILE_TITLE, name.toString())}</strong>
      <Table size="small">
        <TableBody>
          {arrayProps.map(([propName, propValue], index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{lang.get(propName)}</StyledTableCell>
              <StyledTableCell>{propValue}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  )
}