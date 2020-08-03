import React from 'react'
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Accordion from '@material-ui/core/Accordion'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { StyledAccordionSummary, StyledAccordionDetails } from '../../Theme/Dark/AccordionComponents'
import Changes020 from './Changes020'
import Changes030 from './Changes030'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      '& .MuiPaper-root': {
        backgroundColor: 'transparent',
        color: 'white',
      },
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  }),
)

/**
 * Changelog component
 */
export default function Changelog() {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Accordion>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography className={classes.heading}>0.3.0 changes</Typography>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <Changes030 />
        </StyledAccordionDetails>
      </Accordion>
      <Accordion>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography className={classes.heading}>0.2.0 changes</Typography>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <Changes020 />
        </StyledAccordionDetails>
      </Accordion>
    </div>
  )
}