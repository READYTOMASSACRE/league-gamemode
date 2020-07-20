import React from 'react'
import clsx from 'clsx'
import ButtonBase, { ButtonBaseProps as MuiButtonBaseProps} from '@material-ui/core/ButtonBase';
import { Omit } from '@material-ui/types';
import Typography from '@material-ui/core/Typography';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

interface Props {
  thumbUrl: string
}

// compile css styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    image: {
      position: 'relative',
      height: 100,
      width: 100,
      margin: '16px 16px 0',
      '&:hover, &$focusVisible': {
        zIndex: 1,
        '& $imageBackdrop': {
          opacity: 0.9,
        },
        '& $imageTitle': {
          opacity: 1
        },
      },
      '& disabled': {
        opacity: 0.5
      }
    },
    focusVisible: {},
    imageButton: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      wordBreak: 'break-word',
      padding: 8,
      textTransform: 'uppercase',
    },
    imageSrc: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      borderRadius: 3,
    },
    imageBackdrop: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      opacity: 0,
      transition: theme.transitions.create('opacity'),
      borderRadius: 3,
    },
    imageTitle: {
      opacity: 0,
      transition: theme.transitions.create('opacity'),
    },
    active: {
      opacity: .9,
    }
  }),
);

function WeaponItem(props: Props & Omit<MuiButtonBaseProps, keyof Props>) {
  const { thumbUrl, ...other } = props
  const classes = useStyles(props);
  return (
    <ButtonBase
      focusRipple
      className={classes.image}
      style={{
        backgroundImage: `url(${props.thumbUrl})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
      focusVisibleClassName={classes.focusVisible}
      {...other}
    >
      <span className={classes.imageSrc}/>
      <span className={clsx(classes.imageBackdrop, {
        [classes.active]: props.disabled
      })} />
      <span className={classes.imageButton}>
        <Typography
          component="span"
          variant="subtitle1"
          color="inherit"
          className={clsx(classes.imageTitle, {
            [classes.active]: props.disabled
          })}
        >
          {props.children}
        </Typography>
      </span>
    </ButtonBase>
  )
}

export default WeaponItem