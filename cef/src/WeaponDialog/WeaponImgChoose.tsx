import React from 'react'
import ButtonBase, { ButtonBaseProps as MuiButtonBaseProps} from '@material-ui/core/ButtonBase';
import { Omit } from '@material-ui/types';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

interface Props {
  thumbUrl: string
}

// compile css styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    image: {
      position: 'relative',
      height: 42,
      width: 42,
      margin: '2px 2px 0',
      '& disabled': {
        opacity: 0.5
      }
    },
  }),
);

function WeaponImgChoose(props: Props & Omit<MuiButtonBaseProps, keyof Props>) {
  const { thumbUrl, ...other } = props
  const classes = useStyles(props)

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
      {...other}
    >
    </ButtonBase>
  )
}

export default WeaponImgChoose