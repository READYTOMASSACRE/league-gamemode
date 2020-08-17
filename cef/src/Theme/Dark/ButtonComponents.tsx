import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

export const StyledButton = withStyles({
  root: {
    color: 'white',
    borderColor: 'white',
    '&:disabled': {
      color: '#353535',
      borderColor: '#353535',  
    }
  },
})(Button)
