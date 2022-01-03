import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SendRowWrapper from '../send-row-wrapper';
import Identicon from '../../../../components/ui/identicon/identicon.component';
import TokenBalance from '../../../../components/ui/token-balance';
import UserPreferencedCurrencyDisplay from '../../../../components/app/user-preferenced-currency-display';
import { ERC20, PRIMARY } from '../../../../helpers/constants/common';
import { ASSET_TYPES } from '../../../../ducks/send';
import { fa } from '../../../../../.storybook/locales';

export default class SendAssetRow extends Component {
  static propTypes = {
    tokens: PropTypes.arrayOf(
      PropTypes.shape({
        address: PropTypes.string,
        decimals: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        symbol: PropTypes.string,
      }),
    ).isRequired,
    accounts: PropTypes.object.isRequired,
    assetImages: PropTypes.object,
    selectedAddress: PropTypes.string.isRequired,
    sendAssetAddress: PropTypes.string,
    updateSendAsset: PropTypes.func.isRequired,
    nativeCurrency: PropTypes.string,
    nativeCurrencyImage: PropTypes.string,
    handleSetBalance: PropTypes.func,
  };

  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  state = {
    isShowingDropdown: false,
    sendableTokens: [],
  };

  async componentDidMount() {
    const sendableTokens = this.props.tokens.filter((token) => !token.isERC721);
    this.setState({ sendableTokens });
  }

  openDropdown = () => this.setState({ isShowingDropdown: true });

  closeDropdown = () => this.setState({ isShowingDropdown: false });

  selectToken = (type, token) => {
    this.setState(
      {
        isShowingDropdown: false,
      },
      () => {
        this.context.metricsEvent({
          eventOpts: {
            category: 'Transactions',
            action: 'Send Screen',
            name: 'User clicks "Assets" dropdown',
          },
          customVariables: {
            assetSelected: token ? ERC20 : this.props.nativeCurrency,
          },
        });
        this.props.updateSendAsset({
          type,
          details: type === ASSET_TYPES.NATIVE ? null : token,
        });
      },
    );
  };

  render() {
    const { t } = this.context;

    return (
      <SendRowWrapper label={`${t('asset')}:`}>
        <div className="send-v2__asset-dropdown an">
          {this.renderSendToken()}
          {this.state.sendableTokens.length > 0
            ? this.renderAssetDropdown()
            : null}
        </div>
      </SendRowWrapper>
    );
  }

  renderSendToken() {
    const { sendAssetAddress } = this.props;
    const token = this.props.tokens.find(
      ({ address }) => address === sendAssetAddress,
    );
    return (
      <div
        className="send-v2__asset-dropdown__input-wrapper"
        onClick={() => this.setState({ isShowingDropdown: true })}
      >
        {token ? this.renderAsset(token) : this.renderNativeCurrency()}
      </div>
    );
  }

  renderAssetDropdown() {
    const { t } = this.context;
    const { sendableTokens } = this.state;
    const { assetImages, sendAssetAddress } = this.props;
    const {
      accounts,
      selectedAddress,
      nativeCurrency,
      nativeCurrencyImage,
    } = this.props;
    const balanceValue = accounts[selectedAddress]
      ? accounts[selectedAddress].balance
      : '';

    const tokenInfo = this.props.tokens.find(
      ({ address }) => address === sendAssetAddress,
    );

    console.log(sendableTokens, 'sendableTokenssendableTokens', tokenInfo);
    return (
      this.state.isShowingDropdown && (
        <div className="rs-switch-token">
          <div className="page-container-header">
            <img
              onClick={() => this.setState({ isShowingDropdown: false })}
              className="return"
              src="./images/return.png"
            />
            <div className="content">{this.context.t('send')}</div>
          </div>
          <div className="rs-switch-token-cont">
            <div className="title">{this.context.t('asset')}</div>
            <div className="rs-switch-token-list">
              <div
                className={`${!tokenInfo ? 'an' : ''} rs-switch-token-li`}
                onClick={() => this.selectToken(ASSET_TYPES.NATIVE)}
              >
                <Identicon
                  diameter={24}
                  image={nativeCurrencyImage}
                  address={nativeCurrency}
                />
                <div className="rs-switch-coincode">
                  <div className="name">{nativeCurrency}</div>
                  <div className="balance">
                    {`${t('balance')}:`}
                    <UserPreferencedCurrencyDisplay
                      value={balanceValue}
                      type={PRIMARY}
                      isCustom
                    />
                  </div>
                </div>
                <img className="nick" src="./images/nike.png" />
              </div>
              {this.state.sendableTokens.map(
                (token) => (
                  <div
                    className={`${
                      token.address === tokenInfo?.address ? 'an' : ''
                    } rs-switch-token-li`}
                    onClick={() => this.selectToken(ASSET_TYPES.TOKEN, token)}
                  >
                    <Identicon
                      address={token.address}
                      diameter={24}
                      image={assetImages[token.address]}
                    />
                    <div className="rs-switch-coincode">
                      <div className="name">{token.symbol}</div>
                      <div className="balance">
                        {`${t('balance')}:`}
                        <TokenBalance
                          handleSetBalance={this.props.handleSetBalance}
                          token={token}
                        />
                      </div>
                    </div>
                    <img className="nick" src="./images/nike.png" />
                  </div>
                ),
                // this.renderAsset(token, true),
              )}
            </div>
          </div>
        </div>

        // <div>
        //   <div
        //     className="send-v2__asset-dropdown__close-area"
        //     onClick={this.closeDropdown}
        //   />
        //   <div className="send-v2__asset-dropdown__list">
        //     {this.renderNativeCurrency(true)}
        //     {this.state.sendableTokens.map((token) =>
        //       this.renderAsset(token, true),
        //     )}
        //   </div>
        // </div>
      )
    );
  }

  renderNativeCurrency(insideDropdown = false) {
    const { t } = this.context;
    const {
      accounts,
      selectedAddress,
      nativeCurrency,
      nativeCurrencyImage,
    } = this.props;

    const balanceValue = accounts[selectedAddress]
      ? accounts[selectedAddress].balance
      : '';

    return (
      <div
        className={
          this.state.sendableTokens.length > 0
            ? 'send-v2__asset-dropdown__asset'
            : 'send-v2__asset-dropdown__single-asset'
        }
        onClick={() => this.selectToken(ASSET_TYPES.NATIVE)}
      >
        <div className="send-v2__asset-dropdown__asset-icon">
          <Identicon
            diameter={24}
            image={nativeCurrencyImage}
            address={nativeCurrency}
          />
        </div>
        <div className="send-v2__asset-dropdown__asset-data">
          <div className="send-v2__asset-dropdown__symbol">
            {nativeCurrency}
          </div>
          <div className="send-v2__asset-dropdown__name">
            <span className="send-v2__asset-dropdown__name__label">
              {`${t('balance')}:`}
            </span>
            <UserPreferencedCurrencyDisplay
              value={balanceValue}
              type={PRIMARY}
            />
          </div>
        </div>
        {!insideDropdown && this.state.sendableTokens.length > 0 && (
          <img
            className="send-v2__asset-dropdown__asset-down"
            src="./images/down2.png"
          />
        )}
      </div>
    );
  }

  renderAsset(token, insideDropdown = false) {
    const { address, symbol } = token;
    const { t } = this.context;
    const { assetImages } = this.props;

    return (
      <div
        key={address}
        className="send-v2__asset-dropdown__asset"
        onClick={() => this.selectToken(ASSET_TYPES.TOKEN, token)}
      >
        <div className="send-v2__asset-dropdown__asset-icon">
          <Identicon
            address={address}
            diameter={24}
            image={assetImages[address]}
          />
        </div>
        <div className="send-v2__asset-dropdown__asset-data">
          <div className="send-v2__asset-dropdown__symbol">{symbol}</div>
          <div className="send-v2__asset-dropdown__name">
            <span className="send-v2__asset-dropdown__name__label">
              {`${t('balance')}:`}
            </span>
            <TokenBalance
              handleSetBalance={this.props.handleSetBalance}
              token={token}
            />
          </div>
        </div>
        {!insideDropdown && (
          <i className="fa fa-caret-down fa-lg send-v2__asset-dropdown__caret" />
        )}
      </div>
    );
  }
}
