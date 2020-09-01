import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { lang } from '../lib/Language'
import clsx from 'clsx'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    textShadow: 'none',
  },
  horizontal: {},
  vertical: {
    flexDirection: 'column',
  },
  group: {
    display: 'inherit',
    margin: 2,
    alignItems: 'center',
    color: 'white',
    borderRadius: 3,
  },
  medium: {
    padding: 5,
  },
  small: {
    '& $span': {
      padding: 5,
    }
  },
  span: {
    border: '1px solid white',
    borderRadius: 'inherit',
    padding: 'inherit',
    fontSize: 14,
    marginRight: 5,
  },
  default: {
    background: 'rgba(0 0 0 / 55%)',
  },
  outlined: {
    border: '1px solid rgba(0 0 0 / 55%)'
  },
  bordered: {
    textShadow: '1px 1px 1px rgba(0 0 0 / 55%)',
    margin: 0,
    '& $span': {
      textShadow: '1px 1px 0px rgba(255 255 255 / 40%)',
      background: 'rgba(255 255 255 / 70%)',
      color: 'rgb(0 0 0 / 80%)',
      fontWeight: 600,
      boxShadow: '1px 1px 0px 2px rgb(0 0 0 / 55%)',
      border: 'none',
      padding: 2,
    }
  },
  disabled: {
    opacity: .1,
  }
})

export interface Control {
  input?: string[]
  label?: string
  disabled?: boolean
}

export interface ControlProps {
  controls?: Control[]
  direction?: 'horizontal' | 'vertical'
  variant?: 'default' | 'outlined' | 'bordered'
  size?: 'medium' | 'small'
  style?: any
  open?: boolean
}

function renderInputs(inputs: string[], className: string) {
  return (
    <>
      {inputs.map((input, index) => <span key={index} className={className}>{lang.get(input)}</span>)}
    </>
  )
}

/**
 * Control component
 * 
 * Showing control information
 * @param {ControlProps} props 
 */
export default function Controls(props: ControlProps) {
  const classes = useStyles()
  const { controls, direction = 'horizontal', variant = 'default', style = {}, size = 'medium', open = true } = props

  if (typeof controls === 'undefined' || open === false) return <></>

  return (
    <div className={clsx(classes.root, classes[direction])} style={style}>
      {controls.map(({ input, label, disabled }, index) => (
        <div key={index} className={clsx(classes.group, classes[variant], classes[size], (disabled ? classes.disabled : ''))}>
          {input && renderInputs(input, classes.span)}
          {label && <Typography>{lang.get(label)}</Typography>}
        </div>
      ))}
    </div>
  )
}