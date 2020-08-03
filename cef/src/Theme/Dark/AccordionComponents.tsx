import { withStyles } from '@material-ui/core/styles'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'

export const StyledAccordionSummary = withStyles({
  root: {
    backgroundColor: 'rgb(51 51 51 / 54%)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
  },
  expandIcon: {
    color: 'white',
  },
})(AccordionSummary)

export const StyledAccordionDetails = withStyles({
  root: {
    backgroundColor: 'rgb(51 51 51 / 54%)',
  }
})(AccordionDetails)