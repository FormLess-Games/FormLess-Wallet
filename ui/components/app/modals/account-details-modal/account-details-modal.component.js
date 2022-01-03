import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getAccountLink } from '@metamask/etherscan-link';

import copyToClipboard from 'copy-to-clipboard';
import AccountModalContainer from '../account-modal-container';
import QrView from '../../../ui/qr-code';
import EditableLabel from '../../../ui/editable-label';
import Button from '../../../ui/button';
import Tooltip from '../../../ui/tooltip';

export default class AccountDetailsModal extends Component {
  static propTypes = {
    selectedIdentity: PropTypes.object,
    chainId: PropTypes.string,
    showExportPrivateKeyModal: PropTypes.func,
    setAccountLabel: PropTypes.func,
    keyrings: PropTypes.array,
    rpcPrefs: PropTypes.object,
  };

  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  state = {
    accountName: this.props.selectedIdentity?.name,
    modifyDialog: false,
    copied: false,
  };

  componentDidMount() {
    this.copyTimeout = null;
  }

  componentWillUnmount() {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
      this.copyTimeout = null;
    }
  }

  render() {
    const {
      selectedIdentity,
      chainId,
      showExportPrivateKeyModal,
      setAccountLabel,
      keyrings,
      rpcPrefs,
    } = this.props;
    const { name, address } = selectedIdentity;
    const { accountName, modifyDialog, copied } = this.state;

    const keyring = keyrings.find((kr) => {
      return kr.accounts.includes(address);
    });

    let exportPrivateKeyFeatureEnabled = true;
    // This feature is disabled for hardware wallets
    if (keyring?.type?.search('Hardware') !== -1) {
      exportPrivateKeyFeatureEnabled = false;
    }

    return (
      <AccountModalContainer className="account-details-modal">
        {/* <EditableLabel
          className="account-details-modal__name"
          defaultValue={name}
          onSubmit={(label) => setAccountLabel(address, label)}
        /> */}
        {modifyDialog && (
          <div className="modify-address-content">
            <div className="modify-address">
              <div className="modify-address-header">
                <span>{this.context.t('rename')}</span>
                <img
                  src="./images/close.png"
                  onClick={() => this.setState({ modifyDialog: false })}
                />
              </div>
              <div className="modify-address-cont">
                <div className="modify-address-name">
                  {this.context.t('accountName')}
                </div>
                <div className="modify-address-input">
                  <input
                    value={accountName}
                    onChange={(e) => {
                      this.setState({ accountName: e.target.value });
                    }}
                    placeholder={this.context.t('accountName')}
                  />
                </div>
                <div className="modify-address-btn">
                  <div
                    className="modify-address-cancel"
                    onClick={() => this.setState({ modifyDialog: false })}
                  >
                    {this.context.t('cancel')}
                  </div>
                  <div
                    className="modify-address-sure"
                    onClick={() => {
                      setAccountLabel(address, accountName || name);
                      this.setState({ modifyDialog: false });
                    }}
                  >
                    {this.context.t('confirm')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className="address-name"
          onClick={() => this.setState({ modifyDialog: true })}
        >
          <div className="address">{name}</div>
          <i className="fas fa-pencil-alt editable-label__icon" />
        </div>
        <QrView
          Qr={{
            data: address,
          }}
        />
        <Tooltip
          position="bottom"
          title={
            copied
              ? this.context.t('copiedExclamation')
              : this.context.t('copyToClipboard')
          }
        >
          <div
            className="account-details-copy-address"
            onClick={() => {
              this.setState({ copied: true });
              this.copyTimeout = setTimeout(
                () => this.setState({ copied: false }),
                3000,
              );
              copyToClipboard(address);
            }}
          >
            {this.context.t('copyAddress')}
          </div>
        </Tooltip>

        {/* <div className="account-details-modal__divider" />

        <Button
          type="secondary"
          className="account-details-modal__button"
          onClick={() => {
            const accountLink = getAccountLink(address, chainId, rpcPrefs);
            this.context.trackEvent({
              category: 'Navigation',
              event: 'Clicked Block Explorer Link',
              properties: {
                link_type: 'Account Tracker',
                action: 'Account Details Modal',
                block_explorer_domain: accountLink
                  ? new URL(accountLink)?.hostname
                  : '',
              },
            });
            global.platform.openTab({
              url: accountLink,
            });
          }}
        >
          {rpcPrefs.blockExplorerUrl
            ? this.context.t('blockExplorerView', [
                rpcPrefs.blockExplorerUrl.match(/^https?:\/\/(.+)/u)[1],
              ])
            : this.context.t('viewOnEtherscan')}
        </Button>

        {exportPrivateKeyFeatureEnabled ? (
          <Button
            type="secondary"
            className="account-details-modal__button"
            onClick={() => showExportPrivateKeyModal()}
          >
            {this.context.t('exportPrivateKey')}
          </Button>
        ) : null} */}
      </AccountModalContainer>
    );
  }
}
