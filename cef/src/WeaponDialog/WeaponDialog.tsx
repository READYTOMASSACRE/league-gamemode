import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'

import WeaponList from './WeaponList'
import { RPC, RPC_DIALOG } from '../events'
import { register, callServer, callClient } from 'rage-rpc'
import { lang } from '../lib/Language'
import { MSG } from '../messages'

function WeaponDialog() {
  // register setState handlers
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const [choice, setChoice] = React.useState([] as string[])
  const [hasRendered, setHasRendered] = React.useState(false)
  const [items, setItems] = React.useState([
    ["weapon_dagger", "weapon_bat", "weapon_bottle", "weapon_crowbar", "weapon_flashlight", "weapon_golfclub", "weapon_nightstick", "weapon_knuckle"],
  ] as string[][])

  // triggers when the dialog is opened
  const handleOpen = () => {
    setOpen(true)
    setStep(0)
    setChoice([])
    callClient(RPC_DIALOG.CLIENT_DIALOG_OPEN)
  }

  // triggers when the dialog is closed
  const handleClose = () => {
    setOpen(false)
    callClient(RPC_DIALOG.CLIENT_DIALOG_CLOSE)
  }

  // handlers for doing next/prev step in the dialog
  const nextStep = () => setStep(typeof items[step + 1] !== "undefined" ? step + 1 : step)
  const prevStep = () => choice.pop() && setStep(typeof items[step - 1] !== "undefined" ? step - 1 : step)

  // handler to choice
  const handleChoiceClick = (newChoice: string) => {
    setChoice([...choice, newChoice])
    nextStep()
  }

  // effect hook to handle the choice
  React.useEffect(() => {
    if (items.length && choice.length === items.length) {
      handleClose()
      callServer(RPC.CLIENT_WEAPON_REQUEST, choice)
    }
  }, [choice, items.length])

  // effect hook to register rpc calls
  React.useEffect(() => {
    const handleOpenFromRpc = ([weaponSet]: any) => {
      setItems(Array.isArray(weaponSet) ? weaponSet : [])
      handleOpen()
    }

    setHasRendered(true)
    if (!hasRendered) {
      register(RPC_DIALOG.CLIENT_WEAPON_DIALOG_OPEN, handleOpenFromRpc)
      register(RPC_DIALOG.CLIENT_WEAPON_DIALOG_CLOSE, handleClose)
    }
  }, [hasRendered])

  return (
    <Dialog
      disableBackdropClick={!!items[step]}
      disableEscapeKeyDown={!!items[step]}
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      >
      <DialogTitle>
        <Typography gutterBottom>
          {lang.get(MSG.WEAPON_CHOOSE_TEXT, (step+1).toString())}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <WeaponList list={items[step] || [] as string[]} handleClick={handleChoiceClick} choice={choice}/>
      </DialogContent>
      <DialogActions>
        <Button autoFocus variant="outlined" onClick={prevStep} disabled={!!!choice.length}>
          Назад
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default WeaponDialog