import { withStyles } from '@material-ui/core/styles'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'

export const StyledTableCell = withStyles({
  root: {
    borderBottom: 'none',
  },
})(TableCell)

export const StyledTableRow = withStyles({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: 'rgb(101 101 101 / 54%)',
    },
  }
})(TableRow)