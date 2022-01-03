/* eslint-disable no-negated-condition */
/* eslint-disable prettier/prettier */
import log from 'loglevel';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { stripHexPrefix } from 'ethereumjs-util';
import copyToClipboard from 'copy-to-clipboard';
import ReadOnlyInput from '../../../ui/readonly-input';
import Button from '../../../ui/button';
import AccountModalContainer from '../account-modal-container';
import { toChecksumHexAddress } from '../../../../../shared/modules/hexstring-utils';
import Identicon from '../../../ui/identicon';
import { shortenAddress } from '../../../../helpers/utils/util';
import Tooltip from '../../../ui/tooltip';

export default class ExportPrivateKeyModal extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static defaultProps = {
    warning: null,
    previousModalState: null,
  };

  static propTypes = {
    exportAccount: PropTypes.func.isRequired,
    selectedIdentity: PropTypes.object.isRequired,
    warning: PropTypes.node,
    showAccountDetailModal: PropTypes.func.isRequired,
    hideModal: PropTypes.func.isRequired,
    hideWarning: PropTypes.func.isRequired,
    clearAccountDetails: PropTypes.func.isRequired,
    previousModalState: PropTypes.string,
  };

  state = {
    password: '',
    privateKey: null,
    showWarning: true,
    error: null,
    isPassword: true,
  };
  componentDidMount() {
    this.copyTimeout = null;
  }

  componentWillUnmount() {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
      this.copyTimeout = null;
    }
    this.props.clearAccountDetails();
    this.props.hideWarning();
  }

  exportAccountAndGetPrivateKey = (password, address) => {
    const { exportAccount } = this.props;

    exportAccount(password, address)
      .then((privateKey) =>
        this.setState({
          privateKey,
          showWarning: false,
        }),
      )
      .catch((e) => this.setState({ error: e.message }));
  };

  renderPasswordLabel(privateKey) {
    return (
      <span className="export-private-key-modal__password-label">
        {privateKey
          ? this.context.t('copyPrivateKey')
          : this.context.t('typePassword')}
      </span>
    );
  }

  renderPasswordInput(privateKey) {
    const plainKey = privateKey && stripHexPrefix(privateKey);

    if (!privateKey) {
      return (
        <input
          type="password"
          className="export-private-key-modal__password-input"
          onChange={(event) => this.setState({ password: event.target.value })}
        />
      );
    }

    return (
      <ReadOnlyInput
        wrapperclassName="export-private-key-modal__password-display-wrapper"
        inputclassName="export-private-key-modal__password-display-textarea"
        textarea
        value={plainKey}
        onClick={() => copyToClipboard(plainKey)}
      />
    );
  }

  renderButtons(privateKey, address, hideModal) {
    return (
      <div className="export-private-key-modal__buttons">
        {!privateKey && (
          <Button
            type="default"
            large
            className="export-private-key-modal__button export-private-key-modal__button--cancel"
            onClick={() => hideModal()}
          >
            {this.context.t('cancel')}
          </Button>
        )}
        {privateKey ? (
          <Button
            onClick={() => hideModal()}
            type="secondary"
            large
            className="export-private-key-modal__button"
          >
            {this.context.t('done')}
          </Button>
        ) : (
          <Button
            onClick={() =>
              this.exportAccountAndGetPrivateKey(this.state.password, address)
            }
            type="secondary"
            large
            className="export-private-key-modal__button"
            disabled={!this.state.password}
          >
            {this.context.t('confirm')}
          </Button>
        )}
      </div>
    );
  }

  render() {
    const {
      selectedIdentity,
      warning,
      showAccountDetailModal,
      hideModal,
      previousModalState,
    } = this.props;
    const { name, address } = selectedIdentity;

    const {
      privateKey,
      showWarning,
      password,
      error,
      isPassword,
      copied,
    } = this.state;

    return (
      <div className="export-private-key-modal">
        <div className="page-container-header">
          <img
            onClick={() => hideModal()}
            className="return"
            src="./images/return.png"
          />
          <div className="content">{this.context.t('exportPrivateKey')}</div>
        </div>
        <div className="export-private-key-modal-user">
          <Identicon address={address} diameter={50} />
          <div className="name">{name}</div>
          <div className="address">{shortenAddress(address)}</div>
        </div>
        {!privateKey ? (
          <>
            <div className="new-account-content-addAccount bn">
              <div className="name">
                {this.context.t('enterPasswordContinue')}
              </div>
              <div className="new-account-content-input">
                <input
                  value={password}
                  type={isPassword ? 'password' : 'text'}
                  placeholder={this.context.t('password')}
                  onChange={(event) =>
                    this.setState({ password: event.target.value, error: '' })
                  }
                />
                <img
                  onClick={() => this.setState({ isPassword: !isPassword })}
                  className="an"
                  src={isPassword ? './images/unsee.png' : './images/see.png'}
                />
              </div>
            </div>
            <div className="rs-revealSeed-error">{error}</div>
            <div className="export-mnemonic-words-tip">
              {this.context.t('walletSafetyTips9')}
            </div>
            <div className="new-account-btn-list an">
              <div onClick={() => hideModal()}>{this.context.t('cancel')}</div>
              <div
                className="an"
                onClick={() =>
                  this.exportAccountAndGetPrivateKey(
                    this.state.password,
                    address,
                  )
                }
              >
                {this.context.t('next')}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="export-private-key-modal-privateKey">
              <div className="title">{this.context.t('privateKey')}</div>
              <div className="export-private-key-modal-privateKey-cont">
                {privateKey}
                <Tooltip
                  position="bottom"
                  title={
                    copied
                      ? this.context.t('copiedExclamation')
                      : this.context.t('copyToClipboard')
                  }
                >
                  <img
                    onClick={() => {
                      this.setState({ copied: true });
                      this.copyTimeout = setTimeout(
                        () => this.setState({ copied: false }),
                        3000,
                      );
                      copyToClipboard(privateKey);
                    }}
                    src="./images/copy.png"
                  />
                </Tooltip>
              </div>
            </div>
            <div className="export-mnemonic-words-tip">
              {this.context.t('walletSafetyTips9')}
            </div>
            <div onClick={() => hideModal()} className="export-mnemonic-close">
              {this.context.t('close')}
            </div>
          </>
        )}
      </div>
    );
  }
}
