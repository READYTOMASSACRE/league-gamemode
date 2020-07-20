import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import WeaponItem from './WeaponItem'

// compile css styles
const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'center',
  },
})

interface Props {
  list: string[]
  handleClick: Function
  choice: string[]
}

function WeaponList(props: Props) {
  const classes = useStyles()
  return (
    <List className={classes.root}>
      {props.list.map((value: string, index: number) => {
        const weaponName = value.replace(/weapon_/, '')
        const src = `/assets/weapons/${weaponName}.webp`
        const isDisabled = props.choice.indexOf(value) !== -1
        const handleClick = () => props.handleClick(value)

        return <WeaponItem thumbUrl={src} key={index} disabled={isDisabled} onClick={handleClick}>{weaponName}</WeaponItem>
      })}
    </List>
  )
}

export default WeaponList