import React from 'react'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import VoteCard, { VoteCardProps } from './VoteCard'
import TextField from '@material-ui/core/TextField';
import { lang } from '../../lib/Language';
import { MSG } from '../../messages';
import { escapeRegExp } from '../../lib/utils';

const CssTextFiled = withStyles({
  root: {
    '& label': {
      color: 'gray',
    },
    '& label.Mui-focused': {
      color: 'white',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'white',
    },
    '& .MuiOutlinedInput-root': {
      color: 'white',
      '& fieldset': {
        borderColor: 'gray',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white',
      },
    },
  }
})(TextField)

const useStyles = makeStyles({
  card: {
    display: 'flex'
  }
})

export interface VoteProps {
  maps: VoteCardProps[]
}

/**
 * Vote main component
 * @param {VoteProps} props 
 */
export default function Vote(props: VoteProps) {
  const initialMapState = props.maps || []

  const [input, setInput]   = React.useState("")
  const [maps, setMaps]     = React.useState(initialMapState)
  const classes = useStyles()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setInput(event.target.value)

  React.useEffect(() => {
    if (input.length) {
      const regexp = new RegExp(escapeRegExp(input), 'gi')
      const result = initialMapState.filter(map => map.code.match(regexp) || map.id.toString() === input)
      setMaps(result)
    } else {
      setMaps(initialMapState)
    }
  }, [input, initialMapState])

  return (
    <Box>
      <form noValidate autoComplete="off">
        <CssTextFiled
          id="vote-map-search"
          label={lang.get(MSG.GAMEMENU_VOTE_LABEL)}
          placeholder={lang.get(MSG.GAMEMENU_VOTE_PLACEHOLDER)}
          fullWidth
          style={{ margin: 8 }}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
          onChange={handleChange}
        />
      </form>
      <div className={classes.card}>
        {maps.map((mapProps, index) => (
          <VoteCard key={index} {...mapProps} />
        ))}
      </div>
    </Box>
  )
}