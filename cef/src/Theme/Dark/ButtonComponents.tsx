import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

export const StyledButton = withStyles({
  root: {
    color: 'white',
    borderColor: 'white',
  },
})(Button)