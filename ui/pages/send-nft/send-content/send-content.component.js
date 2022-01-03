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

export default class SendContent extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  state = {
    number: '',
    numberError: '',
    address: '',
    addressError: '',
    selectAddress: false,
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
    showQrScanner: PropTypes.func,
    signTransaction: PropTypes.func,
    selectedAddress: PropTypes.string,
    addressBook: PropTypes.array,
    recipientAddress: PropTypes.string,
    selectedAccountName: PropTypes.string,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { recipientAddress } = nextProps;
    if (recipientAddress !== prevState.address) {
      return {
        ...prevState,
        address: recipientAddress,
      };
    }
    return null;
  }

  handleChangeNumber = (value, nftInfo) => {
    if ((value !== 0 && value <= nftInfo.number) || value === '') {
      this.setState({ number: value, numberError: '' });
    } else if (value !== 0 && value >= nftInfo.number) {
      this.setState({ number: nftInfo.number, numberError: '' });
    }
  };

  handleChangeAddress = (value) => {
    if ((value.startsWith('0x') && value.length === 42) || value === '') {
      this.props.handleUpdateSendAddress(value);
      this.setState({ address: value, addressError: '' });
    } else {
      this.setState({
        address: value,
        addressError: this.context.t('addressError'),
      });
    }
  };

  handleNext = async (nftInfo) => {
    const { address, number } = this.state;
    if (
      address.startsWith('0x') &&
      address.length === 42 &&
      ((nftInfo?.states === '1155' && number) || nftInfo?.states === '721')
    ) {
      const { contractAddress, tokenId } = this.props;
      await this.props.addToAddressBookIfNew();
      const promise = this.props.signNFTTransaction({
        ...nftInfo,
        toAddress: address,
        total: Number(number),
      });
      Promise.resolve(promise).then((res) => {
        this.props.history.push(
          `${CONFIRM_TRANSACTION_ROUTE}?contractAddress=${contractAddress}&tokenId=${tokenId}`,
        );
      });
    } else if (!(address.startsWith('0x') && address.length === 42)) {
      this.setState({ addressError: this.context.t('addressError') });
    } else if (
      !((nftInfo?.states === '1155' && number) || nftInfo?.states === '721')
    ) {
      this.setState({ numberError: this.context.t('numberError') });
    }
  };

  scanQrCode = () => {
    this.props.showQrScanner();
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
      contractAddress,
      tokenId,
      chainId,
      accountNFTTokens,
      selectedAddress,
      addressBook,
      recipientAddress,
      selectedAccountName,
    } = this.props;

    console.log(this, 'this-----------');

    const {
      address,
      number,
      numberError,
      addressError,
      selectAddress,
    } = this.state;
    const keys = `${contractAddress}${tokenId}`;
    const info = accountNFTTokens?.[selectedAddress]?.[chainId]?.find(
      (item) => `${item.contractAddress}${item.tokenId}` === keys,
    );
    console.log(keys, accountNFTTokens, '-', info, contractAddress, tokenId);
    const nftInfo = info || {};

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

        <div className="send-v2__form">
          {/* {gasError && this.renderError(gasError)}
          {isEthGasPrice && this.renderWarning(ETH_GAS_PRICE_FETCH_WARNING_KEY)}
          {isAssetSendable === false &&
            this.renderError(UNSENDABLE_ASSET_ERROR_KEY)}
          {error && this.renderError(error)}
          {warning && this.renderWarning()}
          {this.maybeRenderAddContact()} */}
          <div className="rs-send-nft-info">
            <div className="img-cont">
              <img src={nftInfo?.originalImage} />
            </div>
            <div className="nft-name">{nftInfo?.name}</div>
          </div>
          <div className="send-v2__address">
            <div className="title">{this.context.t('from')}</div>
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
          {nftInfo?.states === '1155' && (
            <div className="send-v2__address">
              <div className="title">{this.context.t('number')}</div>
              <div className="cont an">
                <input
                  type="number"
                  value={number}
                  onChange={(e) =>
                    this.handleChangeNumber(e.target.value, nftInfo)
                  }
                  placeholder={this.context.t('inputNumber')}
                />
                <span onClick={() => this.setState({ number: nftInfo.number })}>
                  {this.context.t('allNumber')}
                </span>
              </div>
            </div>
          )}
          {numberError && (
            <div className="send-v2__error-info">{numberError}</div>
          )}
          {/* <SendAmountRow /> */}
          <SendGasRow isNFT />
          {this.props.showHexData && <SendHexDataRow />}
          <div
            onClick={() => this.handleNext(nftInfo)}
            className="send-v2__next"
          >
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
