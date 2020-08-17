import React from 'react'
// import ExpEffect from './ExpEffect'
import WinEffect from './WinEffect'
import DeathEffect from './DeathEffect'

export default function Effects() {
  return (
    <React.Fragment>
      <DeathEffect />
      <WinEffect />
      {/* <ExpEffect /> */}
    </React.Fragment>
  )
}