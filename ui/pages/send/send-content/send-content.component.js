import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PageContainerContent from '../../../components/ui/page-container/page-container-content.component';
import Dialog from '../../../components/ui/dialog';
import {
  ETH_GAS_PRICE_FETCH_WARNING_KEY,
  GAS_PRICE_FETCH_FAILURE_ERROR_KEY,
  GAS_PRICE_EXCESSIVE_ERROR_KEY,
  UNSENDABLE_ASSET_ERROR_KEY,
} from '../../../helpers/constants/error-keys';
import { CONFIRM_TRANSACTION_ROUTE } from '../../../helpers/constants/routes';
import Identicon from '../../../components/ui/identicon/identicon.component';
import { shortenAddress } from '../../../helpers/utils/util';
import SendAmountRow from './send-amount-row';
import SendGasRow from './send-gas-row';
import SendHexDataRow from './send-hex-data-row';
import SendAssetRow from './send-asset-row';
import { ASSET_TYPES } from '../../../ducks/send';
import BigNumber from 'bignumber.js';

export default class SendContent extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  state = {
    number: '',
    address: '',
    selectAddress: false,
    tokenBalance: '0',
  };

  static propTypes = {
    isAssetSendable: PropTypes.bool,
    showAddToAddressBookModal: PropTypes.func,
    showHexData: PropTypes.bool,
    contact: PropTypes.object,
    isOwnedAccount: PropTypes.bool,
    warning: PropTypes.string,
    error: PropTypes.string,
    gasIsExcessive: PropTypes.bool.isRequired,
    isEthGasPrice: PropTypes.bool,
    noGasPrice: PropTypes.bool,
    history: PropTypes.object,
    handleUpdateSendAmount: PropTypes.func,
    handleUpdateSendAddress: PropTypes.func,
    addToAddressBookIfNew: PropTypes.func,
    signTransaction: PropTypes.func,
    selectedAddress: PropTypes.string,
    showQrScanner: PropTypes.func,
    addressBook: PropTypes.array,
    recipientAddress: PropTypes.string,
    selectedAccountName: PropTypes.string,
    asset: PropTypes.object,
    amount: PropTypes.string,
    tokensBalances: PropTypes.string,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { recipientAddress } = nextProps;
    if (recipientAddress !== '' && recipientAddress !== prevState.address) {
      console.log(recipientAddress, prevState);
      return {
        ...prevState,
        address: recipientAddress,
      };
    }
    return null;
  }

  handleChangeNumber = (value) => {
    this.setState({ number: value });
    this.props.handleUpdateSendAmount(Number(value));
  };

  handleChangeAddress = (value) => {
    if ((value.startsWith('0x') && value.length === 42) || value === '') {
      this.setState({ address: value, addressError: '' });
    } else {
      this.setState({
        address: value,
        addressError: this.context.t('addressError'),
      });
    }
    this.props.handleUpdateSendAddress(value);
  };

  handleNext = async () => {
    const { address } = this.state;
    if (!(address.startsWith('0x') && address.length === 42)) {
      this.setState({
        addressError: this.context.t('addressError'),
      });
    } else {
      await this.props.addToAddressBookIfNew();
      const promise = this.props.signTransaction();
      Promise.resolve(promise).then((res) => {
        this.props.history.push(CONFIRM_TRANSACTION_ROUTE);
      });
    }
  };

  scanQrCode = () => {
    this.props.showQrScanner();
  };

  handleSetBalance = (value) => {
    this.setState({ tokenBalance: value });
  };

  render() {
    const {
      warning,
      error,
      gasIsExcessive,
      isEthGasPrice,
      noGasPrice,
      isAssetSendable,
      history,
      selectedAddress,
      addressBook,
      recipientAddress,
      selectedAccountName,
      asset,
    } = this.props;

    const { address, number, addressError, selectAddress } = this.state;

    let gasError;
    if (gasIsExcessive) gasError = GAS_PRICE_EXCESSIVE_ERROR_KEY;
    else if (noGasPrice) gasError = GAS_PRICE_FETCH_FAILURE_ERROR_KEY;

    return (
      <PageContainerContent>
        {selectAddress && (
          <div className="rs-handle-select-addressBook">
            <div className="page-container-header">
              <img
                onClick={() => this.setState({ selectAddress: false })}
                className="return"
                src="./images/return.png"
              />
              <div className="content">{this.context.t('SelectContact')}</div>
            </div>
            <div className="rs-addressBook-list">
              {addressBook.map((item) => (
                <div
                  key={item.address}
                  className="rs-addressBook-li"
                  onClick={() => {
                    this.setState({
                      selectAddress: false,
                      // address: item.address,
                      // addressError: '',
                    });
                    this.handleChangeAddress(item.address);
                  }}
                >
                  <Identicon diameter={35} address={item.address} />
                  <div className="addressBook-info">
                    <div className="name">
                      {item.name || this.context.t('address')}
                    </div>
                    <div className="address">
                      {shortenAddress(item.address)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="send-v2__form rs">
          {/* {gasError && this.renderError(gasError)} */}
          {/* {isEthGasPrice && this.renderWarning(ETH_GAS_PRICE_FETCH_WARNING_KEY)} */}
          {/* {isAssetSendable === false &&
            this.renderError(UNSENDABLE_ASSET_ERROR_KEY)} */}
          {/* {error && this.renderError(error)} */}
          {/* {warning && this.renderWarning()} */}
          {/* {this.maybeRenderAddContact()} */}
          <SendAssetRow
            handleSetBalance={(value) => this.handleSetBalance(value)}
          />
          <div className="send-v2__address">
            <div className="title">{this.context.t('from')} </div>
            <div className="cont">
              <div className="name">{selectedAccountName}</div>
              <div className="address">{selectedAddress}</div>
            </div>
          </div>
          <div className="send-v2__address">
            <div className="title">{this.context.t('to')}</div>
            <div className="cont an">
              <input
                onChange={(e) => this.handleChangeAddress(e.target.value)}
                value={address}
                placeholder={this.context.t('inputAddress')}
              />
              <img
                onClick={() => this.scanQrCode()}
                src="./images/Fillcopy.png"
              />
              <img
                onClick={() => this.setState({ selectAddress: true })}
                className="an"
                src="./images/address.png"
              />
            </div>
          </div>
          {addressError && (
            <div className="send-v2__error-info">{addressError}</div>
          )}
          <SendAmountRow isAll className="rs" />
          {asset.type === ASSET_TYPES.TOKEN &&
            this.props.amount !== '' &&
            this.props.asset.details &&
            new BigNumber(this.state.tokenBalance).comparedTo(
              new BigNumber(this.props.amount).dividedBy(
                new BigNumber(`1e${this.props.asset.details?.decimals}`),
              ),
            ) === -1 && (
              <div className="send-v2__error-info">
                {this.context.t('insufficientBalance')}
              </div>
            )}
          <SendGasRow />
          {this.props.showHexData && <SendHexDataRow />}
          <div onClick={() => this.handleNext()} className="send-v2__next">
            {this.context.t('next')}
          </div>
        </div>
      </PageContainerContent>
    );
  }

  maybeRenderAddContact() {
    const { t } = this.context;
    const {
      isOwnedAccount,
      showAddToAddressBookModal,
      contact = {},
    } = this.props;

    if (isOwnedAccount || contact.name) {
      return null;
    }

    return (
      <Dialog
        type="message"
        className="send__dialog"
        onClick={showAddToAddressBookModal}
      >
        {t('newAccountDetectedDialogMessage')}
      </Dialog>
    );
  }

  renderWarning(gasWarning = '') {
    const { t } = this.context;
    const { warning } = this.props;
    return (
      <Dialog type="warning" className="send__error-dialog">
        {gasWarning === '' ? t(warning) : t(gasWarning)}
      </Dialog>
    );
  }

  renderError(error) {
    const { t } = this.context;
    return (
      <Dialog type="error" className="send__error-dialog">
        {t(error)}
      </Dialog>
    );
  }
}
