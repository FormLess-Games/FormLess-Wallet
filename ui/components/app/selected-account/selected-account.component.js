import React, { Component } from 'react';
import PropTypes from 'prop-types';
import copyToClipboard from 'copy-to-clipboard';
import { shortenAddress } from '../../../helpers/utils/util';
import ConnectedStatusIndicator from '../connected-status-indicator';
import Tooltip from '../../ui/tooltip';
import { toChecksumHexAddress } from '../../../../shared/modules/hexstring-utils';
import { SECOND } from '../../../../shared/constants/time';
import AccountOptionsMenu from '../menu-bar/account-options-menu';
import { getAccountLink } from '@metamask/etherscan-link';
import Copy from '../../../components/ui/icon/copy-icon.component';

class SelectedAccount extends Component {
  state = {
    copied: false,
    accountOptionsMenuOpen: false,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    selectedIdentity: PropTypes.object.isRequired,
    chainId: PropTypes.string,
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
    console.log(this.state, this.props, this, '----------');
    const { accountOptionsMenuOpen, copied } = this.state;
    const { t } = this.context;
    const { selectedIdentity, handleCopy } = this.props;
    const checksummedAddress = toChecksumHexAddress(selectedIdentity.address);
    console.log(
      selectedIdentity,
      getAccountLink(selectedIdentity.address, '0x4', this.props.rpcPrefs),
      '+++++++++++++++++++++++++++++++++++++++++++++',
      this.props.chainId,
      this.props.rpcPrefs,
      this.props,
    );

    return (
      <div className="main-container-address">
        <div className="main-container-address-cont">
          <ConnectedStatusIndicator
            onClick={() => history.push(CONNECTED_ACCOUNTS_ROUTE)}
          />
          <span></span>
          <div className="name">{selectedIdentity.name}</div>       
          <div className="address">({shortenAddress(checksummedAddress)})</div>
          <div className="operation">
            <img
              onClick={() => {
                global.platform.openTab({
                  url: getAccountLink(
                    selectedIdentity.address,
                    this.props.chainId,
                    this.props.rpcPrefs,
                  ),
                });
              }}
              src="./images/operation1.png"
            />
            <Tooltip
              position="bottom"
              title={copied ? t('copiedExclamation') : t('copyToClipboard')}
            >
              <img
                onClick={() => {
                  this.setState({ copied: true });
                  this.copyTimeout = setTimeout(
                    () => this.setState({ copied: false }),
                    SECOND * 3,
                  );
                  copyToClipboard(checksummedAddress);
                }}
                src="./images/operation2.png"
              />
            </Tooltip>
            <img
              ref="operation"
              onClick={() => this.setState({ accountOptionsMenuOpen: true })}
              src="./images/operation3.png"
            />
          </div>
        </div>
        {accountOptionsMenuOpen && (
          <AccountOptionsMenu
            anchorElement={this.refs.operation}
            onClose={() => this.setState({ accountOptionsMenuOpen: false })}
          />
        )}
      </div>

      // <div className="selected-account">
      //   <Tooltip
      //     wrapperClassName="selected-account__tooltip-wrapper"
      //     position="bottom"
      //     title={
      //       this.state.copied ? t('copiedExclamation') : t('copyToClipboard')
      //     }
      //   >
      //     <button
      //       className="selected-account__clickable"
      //       onClick={() => {
      //         this.setState({ copied: true });
      //         this.copyTimeout = setTimeout(
      //           () => this.setState({ copied: false }),
      //           SECOND * 3,
      //         );
      //         copyToClipboard(checksummedAddress);
      //       }}
      //     >
      //       <div className="selected-account__name">
      //         {selectedIdentity.name}
      //       </div>
      //       <div className="selected-account__address">
      //         {shortenAddress(checksummedAddress)}
      //       </div>
      //     </button>
      //   </Tooltip>
      // </div>
    );
  }
}

export default SelectedAccount;
