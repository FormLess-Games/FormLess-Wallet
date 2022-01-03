import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { updatePriorityLink } from '../../../store/actions';

const PurpleSwitch = withStyles({
  switchBase: {
    '&$checked': {
      color: '#FFFFFF',
    },
    '& + $track': {
      backgroundColor: '#fff',
    },
    '&$checked + $track': {
      backgroundColor: '#3DC64D',
      opacity: 1,
    },
  },
  checked: {},
  track: {},
})(Switch);

class PriorityLink extends PureComponent {
  static propTypes = {
    priorityLink: PropTypes.bool,
    updatePriorityLink: PropTypes.func,
  };

  handleChange(e) {
    this.props.updatePriorityLink(e.target.checked);
  }

  render() {
    const { priorityLink } = this.props;
    // disableRipple is required, or production error
    return (
      <PurpleSwitch
        checked={priorityLink}
        onChange={this.handleChange.bind(this)}
        disableRipple
      ></PurpleSwitch>
    );
  }
}

const mapStateToProps = (state) => {
  const { metamask } = state;
  const { priorityLink } = metamask;
  console.log('priorityLink', metamask.priorityLink);
  return {
    priorityLink,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updatePriorityLink: (value) => dispatch(updatePriorityLink(value)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PriorityLink);
