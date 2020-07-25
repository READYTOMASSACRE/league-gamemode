import React from 'react'
import TableContainer from '@material-ui/core/TableContainer'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import clsx from 'clsx'
import { lang } from '../lib/Language'
import { MSG } from '../messages'

const getLineHeight = (length: number) => {
  const DEFAULT_LENGTH = 8
  const DELTA = 0.05
  const DEFAULT_LINE_HEIGHT = 1.43

  const deltaHeight = DEFAULT_LINE_HEIGHT - (length - DEFAULT_LENGTH) * DELTA

  return deltaHeight > 0 ? deltaHeight : 0
}

// compile css styles
const useStyles = makeStyles({
  table: {
    minWidth: 650,
    display: ({ open }: Props) => typeof open === 'undefined' || open ? 'table' : 'none'
  },
  tableContainer: {
    width: '50%',
    background: 'rgba(0, 0, 0, 0.75)',
    maxHeight: 860,
  },
  td: {
    color: 'white',
    lineHeight: ({ team }: Props) => getLineHeight(team.ATTACKERS.players.length + team.DEFENDERS.players.length),
    border: "none",
    padding: '8px 24px 8px 16px',
  },
  tdAtt: {
    color: ({ team }: Props) => team.ATTACKERS.color
  },
  tdDef: {
    color: ({ team }: Props) => team.DEFENDERS.color
  },
  tdAttBroder: {
    borderBottom: ({ team }: Props) => '1px solid ' + team.ATTACKERS.color
  },
  tdDefBroder: {
    borderBottom: ({ team }: Props) => '1px solid ' + team.DEFENDERS.color
  },
  currentPlayer: {
    background: 'rgba(205, 205, 205, .2)',
  },
})

type Props = {
  open?: boolean
  motd: string
  team: {
    [key in Exclude<SHARED.TEAMS, SHARED.TEAMS.SPECTATORS>]: {
      name: string
      color: string
      players: any[]
      score: number
    }
  }
}

export default function Scoreboard(props: Props) {
  const classes = useStyles(props)

  const { team: { ATTACKERS, DEFENDERS }, motd } = props

  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.td}>{motd}</TableCell>
            <TableCell className={classes.td}></TableCell>
            <TableCell className={classes.td} align="right">{lang.get(MSG.KILL)}</TableCell>
            <TableCell className={classes.td} align="right">{lang.get(MSG.DEATH)}</TableCell>
            <TableCell className={classes.td} align="right">{lang.get(MSG.ASSIST)}</TableCell>
            <TableCell className={classes.td} align="right">{lang.get(MSG.LVL)}</TableCell>
            <TableCell className={classes.td} align="right">{lang.get(MSG.DAMAGE)}</TableCell>
            <TableCell className={classes.td} align="right">{lang.get(MSG.PING)}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell className={clsx(classes.tdAtt, classes.tdAttBroder)}>
              <strong>{ATTACKERS.name}  -  {ATTACKERS.players.length} {lang.get(MSG.SCOREBOARD_PLAYERS)}</strong>
            </TableCell>
            <TableCell className={classes.tdAttBroder}></TableCell>
            <TableCell align="right" className={clsx(classes.tdAtt, classes.tdAttBroder)}><strong>{ATTACKERS.score}</strong></TableCell>
            <TableCell className={classes.tdAttBroder}></TableCell>
            <TableCell className={classes.tdAttBroder}></TableCell>
            <TableCell className={classes.tdAttBroder}></TableCell>
            <TableCell className={classes.tdAttBroder}></TableCell>
            <TableCell className={classes.tdAttBroder}></TableCell>
          </TableRow>
          {ATTACKERS.players.map((row, index) => (
            <TableRow key={index}>
              <TableCell className={clsx(classes.td, classes.tdAtt)} component="th" scope="row">{row.name}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdAtt)} align="right">{row.state}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdAtt)} align="right">{row.kill}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdAtt)} align="right">{row.death}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdAtt)} align="right">{row.assist}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdAtt)} align="right">{row.lvl}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdAtt)} align="right">{row.damage}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdAtt)} align="right">{row.ping}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className={clsx(classes.tdDef, classes.tdDefBroder)}>
              <strong>{DEFENDERS.name}  -  {DEFENDERS.players.length} {lang.get(MSG.SCOREBOARD_PLAYERS)}</strong>
            </TableCell>
            <TableCell className={classes.tdDefBroder}></TableCell>
            <TableCell align="right" className={clsx(classes.tdDef, classes.tdDefBroder)}><strong>{DEFENDERS.score}</strong></TableCell>
            <TableCell className={classes.tdDefBroder}></TableCell>
            <TableCell className={classes.tdDefBroder}></TableCell>
            <TableCell className={classes.tdDefBroder}></TableCell>
            <TableCell className={classes.tdDefBroder}></TableCell>
            <TableCell className={classes.tdDefBroder}></TableCell>
          </TableRow>
          {DEFENDERS.players.map((row, index) => (
            <TableRow key={index} className={row.player === 'Player4' ? classes.currentPlayer : ""}>
              <TableCell className={clsx(classes.td, classes.tdDef)} component="th" scope="row">{row.name}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdDef)} align="right">{row.state}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdDef)} align="right">{row.kill}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdDef)} align="right">{row.death}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdDef)} align="right">{row.assist}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdDef)} align="right">{row.lvl}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdDef)} align="right">{row.damage}</TableCell>
              <TableCell className={clsx(classes.td, classes.tdDef)} align="right">{row.ping}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}