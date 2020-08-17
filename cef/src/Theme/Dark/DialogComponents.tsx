import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'

export const StyledDialogComponent = withStyles({
  paper: {
    color: 'white',
    backgroundColor: 'rgb(0 0 0 / 75%)',
  }
})(Dialog)

export const StyledDialogContent = withStyles({
  dividers: {
    borderTop: '1px solid rgb(255 255 255 / 43%)',
    borderBottom: '1px solid rgb(255 255 255 / 43%)',
  }
})(DialogContent)