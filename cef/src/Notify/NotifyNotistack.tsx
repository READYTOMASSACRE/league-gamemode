import React from 'react'
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack'
import { RPC_DIALOG } from '../events'
import { register } from 'rage-rpc'

const validateVariant = (variant: VariantType = 'default'): VariantType => {
  variant = ['default', 'error', 'success', 'warning', 'info'].indexOf(variant) !== -1
    ? variant
    : 'default'

  return variant
}

/**
 * Notify component
 */
const Notify = () => {
  // set state handlers
  const [render, setRender]   = React.useState(false)
  const { enqueueSnackbar }   = useSnackbar()

  // set effects
  React.useEffect(() => {
    if (render) return
    setRender(true)
    register(RPC_DIALOG.CLIENT_NOTIFY_NOTISTACK, ([message, variant]) => (
      enqueueSnackbar(message.replace(/!{.*}/g, ''), { variant: validateVariant(variant) })
    ))
  }, [render, enqueueSnackbar])

  return <React.Fragment></React.Fragment>
}

export default function NotifyNotistack() {
  const vertical = 'bottom',
    horizontal = 'center'

  return (
    <SnackbarProvider
      maxSnack={5}
      anchorOrigin={{ vertical, horizontal}}
      style={{ opacity: .75 }}
    >
      <Notify />
    </SnackbarProvider>
  )
}