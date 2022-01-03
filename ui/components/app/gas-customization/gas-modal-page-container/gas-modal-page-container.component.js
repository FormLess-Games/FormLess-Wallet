import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import PageContainer from '../../../ui/page-container';
import { Tabs, Tab } from '../../../ui/tabs';
import AdvancedTabContent from './advanced-tab-content';
import BasicTabContent from './basic-tab-content';
import UserPreferencedCurrencyDisplay from '../../user-preferenced-currency-display';
import { SECONDARY } from '../../../../helpers/constants/common';

export default class GasModalPageContainer extends Component {
  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      gasPrice: this.props.customGasPrice,
      gasLimit: this.props.customGasLimit,
    };
    this.changeGasPrice = debounce(this.changeGasPrice, 500);
    this.changeGasLimit = debounce(this.changeGasLimit, 500);
  }

  static propTypes = {
    hideBasic: PropTypes.bool,
    updateCustomGasPrice: PropTypes.func,
    updateCustomGasLimit: PropTypes.func,
    insufficientBalance: PropTypes.bool,
    fetchBasicGasEstimates: PropTypes.func,
    gasPriceButtonGroupProps: PropTypes.object,
    infoRowProps: PropTypes.shape({
      originalTotalFiat: PropTypes.string,
      originalTotalEth: PropTypes.string,
      newTotalFiat: PropTypes.string,
      newTotalEth: PropTypes.string,
      sendAmount: PropTypes.string,
      transactionFee: PropTypes.string,
    }),
    onSubmit: PropTypes.func,
    customModalGasPriceInHex: PropTypes.string,
    customModalGasLimitInHex: PropTypes.string,
    cancelAndClose: PropTypes.func,
    customPriceIsSafe: PropTypes.bool,
    isSpeedUp: PropTypes.bool,
    isRetry: PropTypes.bool,
    disableSave: PropTypes.bool,
    showFiat: PropTypes.bool,
    customPriceIsExcessive: PropTypes.bool.isRequired,
  };

  componentDidUpdate(prevProps) {
    const {
      customGasPrice: prevCustomGasPrice,
      customGasLimit: prevCustomGasLimit,
    } = prevProps;
    const { customGasPrice, customGasLimit } = this.props;
    console.log(9999, {
      prevCustomGasPrice,
      customGasPrice,
      prevCustomGasLimit,
      customGasLimit,
    });
    const { gasPrice, gasLimit } = this.state;
    if (customGasPrice !== prevCustomGasPrice && customGasPrice !== gasPrice) {
      this.setState({ gasPrice: customGasPrice });
    }
    if (customGasLimit !== prevCustomGasLimit && customGasLimit !== gasLimit) {
      this.setState({ gasLimit: customGasLimit });
    }
  }

  componentDidMount() {
    this.props.fetchBasicGasEstimates();
  }

  onChangeGasLimit = (e) => {
    this.setState({ gasLimit: e.target.value });
    this.changeGasLimit({ target: { value: e.target.value } });
  };

  changeGasLimit = (e) => {
    this.props.updateCustomGasLimit(Number(e.target.value));
  };

  onChangeGasPrice = (e) => {
    this.setState({ gasPrice: e.target.value });
    this.changeGasPrice({ target: { value: e.target.value } });
  };

  changeGasPrice = (e) => {
    this.props.updateCustomGasPrice(Number(e.target.value));
  };

  renderAdvancedTabContent() {
    const {
      updateCustomGasPrice,
      updateCustomGasLimit,
      customModalGasPriceInHex,
      customModalGasLimitInHex,
      insufficientBalance,
      customPriceIsSafe,
      isSpeedUp,
      isRetry,
      customPriceIsExcessive,
      infoRowProps: { transactionFee },
    } = this.props;

    return (
      <AdvancedTabContent
        updateCustomGasPrice={updateCustomGasPrice}
        updateCustomGasLimit={updateCustomGasLimit}
        customModalGasPriceInHex={customModalGasPriceInHex}
        customModalGasLimitInHex={customModalGasLimitInHex}
        transactionFee={transactionFee}
        insufficientBalance={insufficientBalance}
        customPriceIsSafe={customPriceIsSafe}
        isSpeedUp={isSpeedUp}
        isRetry={isRetry}
        customPriceIsExcessive={customPriceIsExcessive}
      />
    );
  }

  renderInfoRows(newTotalFiat, newTotalEth, sendAmount, transactionFee) {
    return (
      <div className="gas-modal-content__info-row-wrapper">
        <div className="gas-modal-content__info-row">
          <div className="gas-modal-content__info-row__send-info">
            <span className="gas-modal-content__info-row__send-info__label">
              {this.context.t('sendAmount')}
            </span>
            <span className="gas-modal-content__info-row__send-info__value">
              {sendAmount}
            </span>
          </div>
          <div className="gas-modal-content__info-row__transaction-info">
            <span className="gas-modal-content__info-row__transaction-info__label">
              {this.context.t('transactionFee')}
            </span>
            <span className="gas-modal-content__info-row__transaction-info__value">
              {transactionFee}
            </span>
          </div>
          <div className="gas-modal-content__info-row__total-info">
            <span className="gas-modal-content__info-row__total-info__label">
              {this.context.t('newTotal')}
            </span>
            <span className="gas-modal-content__info-row__total-info__value">
              {newTotalEth}
            </span>
          </div>
          <div className="gas-modal-content__info-row__fiat-total-info">
            <span className="gas-modal-content__info-row__fiat-total-info__value">
              {newTotalFiat}
            </span>
          </div>
        </div>
      </div>
    );
  }

  renderTabs() {
    const {
      gasPriceButtonGroupProps,
      hideBasic,
      infoRowProps: { newTotalFiat, newTotalEth, sendAmount, transactionFee },
    } = this.props;

    let tabsToRender;
    if (hideBasic) {
      tabsToRender = [
        {
          name: this.context.t('advanced'),
          content: this.renderAdvancedTabContent(),
        },
      ];
    } else {
      tabsToRender = [
        {
          name: this.context.t('basic'),
          content: this.renderBasicTabContent(gasPriceButtonGroupProps),
        },
        {
          name: this.context.t('advanced'),
          content: this.renderAdvancedTabContent(),
        },
      ];
    }

    return (
      <Tabs>
        {tabsToRender.map(({ name, content }, i) => (
          <Tab name={name} key={`gas-modal-tab-${i}`}>
            <div className="gas-modal-content">
              {content}
              {this.renderInfoRows(
                newTotalFiat,
                newTotalEth,
                sendAmount,
                transactionFee,
              )}
            </div>
          </Tab>
        ))}
      </Tabs>
    );
  }

  render() {
    const {
      cancelAndClose,
      onSubmit,
      customModalGasPriceInHex,
      customModalGasLimitInHex,
      disableSave,
      isSpeedUp,
      infoRowProps: { transactionFee, sendAmount, newTotalEth, newTotalFiat },
      customGasTotal,
      showFiat,
    } = this.props;
    console.log(this);
    const { gasPrice, gasLimit } = this.state;

    return (
      <div className="gas-modal-page-container">
        <div className="page-container rs-add-token rs-newGas">
          <div className="page-container-header">
            <img
              onClick={() => cancelAndClose()}
              className="return"
              src="./images/return.png"
            />
            <div className="content">{this.context.t('customGas')}</div>
          </div>
          <div className="rs-newgas-title">
            {this.context.t('newTransactionFee')}
          </div>
          <div className="rs-newgas">{transactionFee}</div>
          <div className="new-account-content-addAccount bn">
            <div className="name">
              {this.context.t('transactionFee')} (GWAI)
            </div>
            <div className="new-account-content-input">
              <input
                type="number"
                min="0"
                placeholder={this.context.t('transactionFee')}
                value={gasPrice}
                onChange={(e) => this.onChangeGasPrice(e)}
              />
            </div>
          </div>
          <div className="new-account-content-addAccount bn">
            <div className="name">{this.context.t(gasLimit)} (GasLimit)</div>
            <div className="new-account-content-input">
              <input
                type="number"
                min="0"
                placeholder={this.context.t(gasLimit)}
                value={gasLimit}
                onChange={(e) => this.onChangeGasLimit(e)}
              />
            </div>
          </div>
          <div className="rs-newgas-li an">
            <span>{this.context.t('sendAmount')}</span>
            <em>{sendAmount}</em>
          </div>
          <div className="rs-newgas-li">
            <span>{this.context.t('transactionFee')}</span>
            <em>{transactionFee}</em>
          </div>
          <div className="rs-newgas-li">
            <span>{this.context.t('total')}</span>
            <em>{newTotalEth}</em>
          </div>
          {showFiat && <div className="rs-gas-zh">{newTotalFiat}</div>}
          <div
            onClick={() => {
              gasPrice &&
                gasLimit &&
                onSubmit(customModalGasLimitInHex, customModalGasPriceInHex);
            }}
            className={`${!gasPrice || !gasLimit ? 'an' : ''} add-nft-btn`}
          >
            {this.context.t('add')}
          </div>
        </div>
        {/* <PageContainer
          title={this.context.t('customGas')}
          subtitle={this.context.t('customGasSubTitle')}
          tabsComponent={this.renderTabs()}
          disabled={disableSave}
          onCancel={() => cancelAndClose()}
          onClose={() => cancelAndClose()}
          onSubmit={() => {
            if (isSpeedUp) {
              this.context.metricsEvent({
                eventOpts: {
                  category: 'Navigation',
                  action: 'Activity Log',
                  name: 'Saved "Speed Up"',
                },
              });
            }
            onSubmit(customModalGasLimitInHex, customModalGasPriceInHex);
          }}
          submitText={this.context.t('save')}
          headerCloseText={this.context.t('close')}
          hideCancel
        /> */}
      </div>
    );
  }
}
