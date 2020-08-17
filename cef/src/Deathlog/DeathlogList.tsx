import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Deathlog, { DeathlogProps } from './Deathlog'
import { useInterval } from '../lib/utils'
import { register } from 'rage-rpc'
import { RPC } from '../events'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    right: 0,
    marginRight: 5,
    top: '5%',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
})

const alive     = 5000

export type DeathlogItem = DeathlogProps & { id: number, created: number }

/**
 * Deathlog list component
 */
export default function DeathlogList() {
  const [items, setItems] = React.useState<DeathlogItem[]>([])
  const [render, setRender] = React.useState(false)

  const classes = useStyles()

  React.useEffect(() => {
    if (!render) {
      setRender(true)

      register(RPC.CLIENT_DEATHLOG, ([ deathlog ]) => {
        const created = Date.now()
        const newItem: DeathlogItem = {...deathlog, ...{ id: created, created, checked: true }}
        setItems(items => items.concat(newItem))
      })
    }
  }, [render, items])

  useInterval(() => {
    if (items.length) {
      let changed = 0
      const newItems = items.map(item => {
        if (item.checked && Date.now() - item.created > alive) {
          item.checked = false
          changed++
        }

        return item
      })

      if (changed) {
        setItems(newItems)
      } else {
        const visibleItems = items.filter(item => item.checked)
        if (visibleItems.length !== items.length) {
          setItems(items => items.filter(item => item.checked))
        }
      }
    }
  }, 1000)

  return (
    <Box className={classes.root}>
      {items.map((item) => <Deathlog key={item.id} {...item} />)}
    </Box>
  )
}