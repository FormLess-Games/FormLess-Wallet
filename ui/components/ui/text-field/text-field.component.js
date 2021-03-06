import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MaterialTextField from '@material-ui/core/TextField';

const inputLabelBase = {
  transform: 'none',
  transition: 'none',
  position: 'initial',
  color: '#fff',
};

const styles = {
  materialLabel: {
    '&$materialFocused': {
      color: '#aeaeae',
    },
    '&$materialError': {
      color: '#aeaeae',
    },
    'fontWeight': '400',
    'color': '#aeaeae',
  },
  materialFocused: {},
  materialUnderline: {
    '&:after': {
      borderBottom: `2px solid rgb(3, 125, 214)`,
    },
  },
  materialError: {},
  materialWhitePaddedRoot: {
    color: '#aeaeae',
  },
  materialWhitePaddedInput: {
    'padding': '8px',

    '&::placeholder': {
      color: '#aeaeae',
    },
  },
  materialWhitePaddedFocused: {
    color: '#fff',
  },
  materialWhitePaddedUnderline: {
    '&:after': {
      borderBottom: '2px solid #fff',
    },
  },
  // Non-material styles
  formLabel: {
    '&$formLabelFocused': {
      color: '#5b5b5b',
    },
    '&$materialError': {
      color: '#5b5b5b',
    },
  },
  formLabelFocused: {},
  inputFocused: {},
  inputDisabled: {},
  inputRoot: {
    'label + &': {
      marginTop: '9px',
    },
    'height': '48px',
    'padding': '0 16px',
    'display': 'flex',
    'alignItems': 'center',
    'color': '#fff',
    'background': 'url(./images/unlock-input.png)',
    'background-repeat': 'no-repeat',
    'background-size': '100%',
    '&$inputDisabled': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    '& .MuiInputBase-input': {
      padding: '0 0 7px',
    },
  },

  largeInputLabel: {
    ...inputLabelBase,
    fontSize: '1rem',
  },
  inputLabel: {
    ...inputLabelBase,
    fontSize: '.75rem',
  },
  inputMultiline: {
    lineHeight: 'initial !important',
  },
};

const getMaterialThemeInputProps = ({
  dir,
  classes: { materialLabel, materialFocused, materialError, materialUnderline },
  startAdornment,
  min,
  max,
  autoComplete,
}) => ({
  InputLabelProps: {
    classes: {
      root: materialLabel,
      focused: materialFocused,
      error: materialError,
    },
  },
  InputProps: {
    startAdornment,
    classes: {
      underline: materialUnderline,
    },
    inputProps: {
      dir,
      min,
      max,
      autoComplete,
    },
  },
});

const getMaterialWhitePaddedThemeInputProps = ({
  dir,
  classes: {
    materialWhitePaddedRoot,
    materialWhitePaddedFocused,
    materialWhitePaddedInput,
    materialWhitePaddedUnderline,
  },
  startAdornment,
  min,
  max,
  autoComplete,
}) => ({
  InputProps: {
    startAdornment,
    classes: {
      root: materialWhitePaddedRoot,
      focused: materialWhitePaddedFocused,
      input: materialWhitePaddedInput,
      underline: materialWhitePaddedUnderline,
    },
    inputProps: {
      dir,
      min,
      max,
      autoComplete,
    },
  },
});

const getBorderedThemeInputProps = ({
  dir,
  classes: {
    formLabel,
    formLabelFocused,
    materialError,
    largeInputLabel,
    inputLabel,
    inputRoot,
    input,
    inputFocused,
    inputDisabled,
  },
  largeLabel,
  startAdornment,
  min,
  max,
  autoComplete,
}) => ({
  InputLabelProps: {
    shrink: true,
    className: largeLabel ? largeInputLabel : inputLabel,
    classes: {
      root: formLabel,
      focused: formLabelFocused,
      error: materialError,
    },
  },
  InputProps: {
    startAdornment,
    disableUnderline: true,
    classes: {
      root: inputRoot,
      input,
      focused: inputFocused,
      disabled: inputDisabled,
    },
    inputProps: {
      dir,
      min,
      max,
      autoComplete,
    },
  },
});

const themeToInputProps = {
  'material': getMaterialThemeInputProps,
  'bordered': getBorderedThemeInputProps,
  'material-white-padded': getMaterialWhitePaddedThemeInputProps,
};

const TextField = ({
  error,
  classes,
  theme,
  startAdornment,
  largeLabel,
  dir,
  min,
  max,
  autoComplete,
  ...textFieldProps
}) => {
  const inputProps = themeToInputProps[theme]({
    classes,
    startAdornment,
    largeLabel,
    dir,
    min,
    max,
    autoComplete,
  });

  return (
    <MaterialTextField
      error={Boolean(error)}
      helperText={error}
      {...inputProps}
      {...textFieldProps}
    />
  );
};

TextField.defaultProps = {
  error: null,
  dir: 'auto',
  theme: 'bordered',
};

TextField.propTypes = {
  error: PropTypes.string,
  classes: PropTypes.object,
  dir: PropTypes.string,
  theme: PropTypes.oneOf(['bordered', 'material', 'material-white-padded']),
  startAdornment: PropTypes.element,
  largeLabel: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
  autoComplete: PropTypes.string,
};

export default withStyles(styles)(TextField);
