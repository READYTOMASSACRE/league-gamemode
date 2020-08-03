import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { lang } from '../../lib/Language'
import { MSG } from '../../messages'
import { callServer } from 'rage-rpc'
import { RPC } from '../../events'

const useStyles = makeStyles({
  root: {
    maxWidth: 200,
    margin: 5,
    border: '2px solid white',
  },
});

export interface VoteCardProps {
  id: number
  code: string
}

/**
 * Vote card component
 * @param {VoteCardProps} props 
 */
export default function VoteCard(props: VoteCardProps) {
  const classes = useStyles()

  const handleClick = (_: React.MouseEvent, id: number) => callServer(RPC.CEF_GAMEMENU_VOTE_NOMINATE, id)

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2">
        #{props.id} {props.code}
          <Button
            size="small"
            color="primary"
            onClick={event => handleClick(event, props.id)}
          >
            {lang.get(MSG.GAMEMENU_VOTE_NOMINATE)}
          </Button>
        </Typography>
      </CardContent>
    </Card>
  )
}