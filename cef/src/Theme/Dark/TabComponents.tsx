import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs'

export const GameMenuTabs = withStyles({
  root: {
    backgroundColor: 'black',
  },
  indicator: {
    backgroundColor: 'white',
  }
})(Tabs)