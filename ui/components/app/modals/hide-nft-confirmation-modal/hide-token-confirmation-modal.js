import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../../store/actions';
import Identicon from '../../../ui/identicon';
import Button from '../../../ui/button';
import { getMostRecentOverviewPage } from '../../../../ducks/history/history';

function mapStateToProps(state) {
  return {
    nftInfo: state.appState.modal.modalState.props.nftInfo,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    hideModal: () => dispatch(actions.hideModal()),
    removeNFTToken: (nftInfo) => {
      dispatch(actions.removeNFTToken(nftInfo)).then((arr) => {
        dispatch(actions.hideModal());
        window.history.go(-1);
      });
    },
  };
}

class HideTokenConfirmationModal extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    removeNFTToken: PropTypes.func.isRequired,
    hideModal: PropTypes.func.isRequired,
    nftInfo: PropTypes.object,
  };

  state = {};

  render() {
    const { nftInfo, removeNFTToken, hideModal } = this.props;

    return (
      <div className="hide-token-confirmation">
        <div className="hide-token-confirmation__container">
          <div className="hide-token-confirmation__title">
            {this.context.t('hide')}
            {nftInfo.name}
          </div>
          <div className="rs-nft-cont">
            <img src={nftInfo.originalImage} />
          </div>
          <div className="hide-token-confirmation__buttons">
            <Button
              type="default"
              className="hide-token-confirmation__button"
              data-testid="hide-token-confirmation__cancel"
              onClick={() => hideModal()}
            >
              {this.context.t('cancel')}
            </Button>
            <Button
              type="secondary"
              className="hide-token-confirmation__button"
              data-testid="hide-token-confirmation__hide"
              onClick={() => removeNFTToken(nftInfo)}
            >
              {this.context.t('hide')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HideTokenConfirmationModal);
