import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tab from '@material-ui/core/Tab'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import PeopleIcon from '@material-ui/icons/People'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import HowToVoteIcon from '@material-ui/icons/HowToVote'
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import TabPanel from './TabPanel'
import PlayersWrapper from './Players/PlayersWrapper'
import HistoryWrapper from './History/HistoryWrapper'
import TopPlayersWrapper from './Players/TopPlayersWrapper'
import CreditsWrapper from './Credits/CreditsWrapper'
import VoteWrapper from './Vote/VoteWrapper'
import { lang } from '../lib/Language'
import { MSG } from '../messages'
import { register } from 'rage-rpc'
import { RPC_DIALOG } from '../events'
import { GameMenuContext, initialState, reducer, GAMEMENU } from './Reducer'
import { changeActions, Actions, historyRequest, topRequest, creditsRequest } from './Actions'
import ProfileWrapper from './Profile/ProfileWrapper'
import { GameMenuTabs } from '../Theme/Dark/TabComponents'


function tabProps(index: any) {
  return {
    id: `gamemenu-tab-${index}`,
    'aria-controls': `gamemenu-tabpanel-${index}`,
  };
}

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    width: 1024,
    height: 768,
    overflowY: "auto",
    backgroundColor: 'rgba(0, 0, 0, .75)',
    color: 'white',
    '& td': {
      color: 'white',
    },
    '& th': {
      color: 'white',
    },
  }
})

/**
 * GameMenu main component
 */
export default function GameMenu() {
  const classes = useStyles()

  // register reducer
  const [state, dispatch]   = React.useReducer(reducer, initialState)
  // register state handlers
  const [value, setValue]   = React.useState(GAMEMENU.PROFILE)
  const [open, setOpen]     = React.useState(false)
  const [render, setRender] = React.useState(false)

  // do once effect when component has rendered
  React.useEffect(() => {
    if (!render) {
      setRender(true)
      register(RPC_DIALOG.CLIENT_GAMEMENU_TOGGLE, ([ toggle ]) => setOpen(toggle))

      // get round history
      historyRequest(dispatch)
      // get top players
      topRequest(dispatch)
      // get credits info
      creditsRequest(dispatch)
    }
  }, [render])

  // invoke request from changeActions when tab has been changed
  React.useEffect(() => {
    handleDispatch(value, changeActions)
  }, [value])

  // handler to invoke a request
  const handleDispatch = (type: GAMEMENU, actions: Partial<Actions>, ...args: any[]) => {
    if (typeof actions[type] !== 'undefined') {
      const action = actions[type]
      if (typeof action === 'function') {
        action(dispatch, ...args)
      } else {
        dispatch({ type, payload: action })
      }
    }
  }

  // handler to trigger a tab change
  const handleChange = (_: React.ChangeEvent<{}>, type: GAMEMENU) => setValue(type)

  // close the GameMenu
  if (!open) return <></>

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <GameMenuTabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
        >
          <Tab label={lang.get(MSG.GAMEMENU_PROFILE)} icon={<AccountBoxIcon />} {...tabProps(GAMEMENU.PROFILE)} />
          <Tab label={lang.get(MSG.GAMEMENU_PLAYERS)} icon={<PeopleIcon />} {...tabProps(GAMEMENU.PLAYERS)} />
          <Tab label={lang.get(MSG.GAMEMENU_HISTORY)} icon={<AccessTimeIcon />} {...tabProps(GAMEMENU.HISTORY)} />
          <Tab label={lang.get(MSG.GAMEMENU_VOTE)} icon={<HowToVoteIcon />} {...tabProps(GAMEMENU.VOTE)} />
          <Tab label={lang.get(MSG.GAMEMENU_TOP)} icon={<EmojiEventsIcon />} {...tabProps(GAMEMENU.TOP)} />
          <Tab label={lang.get(MSG.GAMEMENU_CREDITS)} icon={<InfoOutlinedIcon />} {...tabProps(GAMEMENU.CREDITS)} />
        </GameMenuTabs>
      </AppBar>
      <GameMenuContext.Provider value={{dispatch, state}}>
        <TabPanel value={value} index={GAMEMENU.PROFILE}><ProfileWrapper /></TabPanel>
        <TabPanel value={value} index={GAMEMENU.PLAYERS}><PlayersWrapper /></TabPanel>
        <TabPanel value={value} index={GAMEMENU.HISTORY}><HistoryWrapper /></TabPanel>
        <TabPanel value={value} index={GAMEMENU.VOTE}><VoteWrapper /></TabPanel>
        <TabPanel value={value} index={GAMEMENU.TOP}><TopPlayersWrapper /></TabPanel>
        <TabPanel value={value} index={GAMEMENU.CREDITS}><CreditsWrapper /></TabPanel>
      </GameMenuContext.Provider>
    </div>
  )
}