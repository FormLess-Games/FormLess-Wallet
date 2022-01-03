import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import NativeSelect from '@material-ui/core/NativeSelect';

import { withStyles } from '@material-ui/core/styles';

const SelectStyle = withStyles({
  root: {
    'width': '100%',
    'height': '44px',
    'background': 'url(./images/unlock-input.png)',
    'background-size': '100%',
    'background-repeat': 'no-repeat',
    'color': '#FFFFFF',
    'box-sizing': 'border-box',
  },
  select: {
    '&$select': {
      padding: '13px 6px',
    },
    '&:not([multiple]) option': {
      'background-color': '#292A36',
      'color': '#fff',
    },
  },
  icon: {
    color: '#fff',
  },
})(NativeSelect);

const Dropdown = ({ disabled, onChange, options, selectedOption, title }) => {
  const _onChange = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      onChange(event.target.value);
    },
    [onChange],
  );

  return (
    <SelectStyle
      disabled={disabled}
      title={title}
      onChange={_onChange}
      value={selectedOption}
      id={title}
      disableUnderline
    >
      {options.map((option) => {
        return (
          <option key={option.value} value={option.value}>
            {option.name || option.value}
          </option>
        );
      })}
    </SelectStyle>
  );
};

Dropdown.propTypes = {
  disabled: PropTypes.bool,
  title: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.exact({
      name: PropTypes.string,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedOption: PropTypes.string,
};

Dropdown.defaultProps = {
  disabled: false,
  title: undefined,
  selectedOption: null,
};

export default Dropdown;
