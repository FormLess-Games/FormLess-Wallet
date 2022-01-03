import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import copyToClipboard from 'copy-to-clipboard';
import { getBlockExplorerLink } from '@metamask/etherscan-link';
import SenderToRecipient from '../../ui/sender-to-recipient';
import { FLAT_VARIANT } from '../../ui/sender-to-recipient/sender-to-recipient.constants';
import TransactionActivityLog from '../transaction-activity-log';
import TransactionBreakdown from '../transaction-breakdown';
import Button from '../../ui/button';
import Tooltip from '../../ui/tooltip';
import Copy from '../../ui/icon/copy-icon.component';
import Popover from '../../ui/popover';
import { SECOND } from '../../../../shared/constants/time';
import { TRANSACTION_TYPES } from '../../../../shared/constants/transaction';
import { toChecksumHexAddress } from '../../../../shared/modules/hexstring-utils';
import { getHexGasTotal } from '../../../helpers/utils/confirm-tx.util';
import { sumHexes } from '../../../helpers/utils/transactions.util';
import { shortenAddress } from '../../../helpers/utils/util';
import { hexToDecimal } from '../../../helpers/utils/conversions.util';
import { GWEI, PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import UserPreferencedCurrencyDisplay from '../user-preferenced-currency-display';
import CurrencyDisplay from '../../ui/currency-display';

export default class TransactionListItemDetails extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static defaultProps = {
    recipientEns: null,
  };

  static propTypes = {
    onCancel: PropTypes.func,
    onRetry: PropTypes.func,
    showCancel: PropTypes.bool,
    showSpeedUp: PropTypes.bool,
    showRetry: PropTypes.bool,
    isEarliestNonce: PropTypes.bool,
    cancelDisabled: PropTypes.bool,
    primaryCurrency: PropTypes.string,
    transactionGroup: PropTypes.object,
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    recipientEns: PropTypes.string,
    recipientAddress: PropTypes.string,
    rpcPrefs: PropTypes.object,
    senderAddress: PropTypes.string.isRequired,
    tryReverseResolveAddress: PropTypes.func.isRequired,
    senderNickname: PropTypes.string.isRequired,
    recipientNickname: PropTypes.string,
    nativeCurrency: PropTypes.string,
    secondaryCurrency: PropTypes.string,
  };

  state = {
    justCopied: false,
  };

  handleBlockExplorerClick = () => {
    const {
      transactionGroup: { primaryTransaction },
      rpcPrefs,
    } = this.props;
    const blockExplorerLink = getBlockExplorerLink(
      primaryTransaction,
      rpcPrefs,
    );

    this.context.trackEvent({
      category: 'Transactions',
      event: 'Clicked Block Explorer Link',
      properties: {
        link_type: 'Transaction Block Explorer',
        action: 'Transaction Details',
        block_explorer_domain: blockExplorerLink
          ? new URL(blockExplorerLink)?.hostname
          : '',
      },
    });

    global.platform.openTab({
      url: blockExplorerLink,
    });
  };

  handleCancel = (event) => {
    const { onCancel, onClose } = this.props;
    onCancel(event);
    onClose();
  };

  handleRetry = (event) => {
    const { onClose, onRetry } = this.props;
    onRetry(event);
    onClose();
  };

  handleCopyTxId = () => {
    const { transactionGroup } = this.props;
    const { primaryTransaction: transaction } = transactionGroup;
    const { hash } = transaction;

    this.context.metricsEvent({
      eventOpts: {
        category: 'Navigation',
        action: 'Activity Log',
        name: 'Copied Transaction ID',
      },
    });

    this.setState({ justCopied: true }, () => {
      copyToClipboard(hash);
      setTimeout(() => this.setState({ justCopied: false }), SECOND);
    });
  };

  componentDidMount() {
    const { recipientAddress, tryReverseResolveAddress } = this.props;

    if (recipientAddress) {
      tryReverseResolveAddress(recipientAddress);
    }
  }

  renderCancel() {
    const { t } = this.context;
    const { showCancel, cancelDisabled } = this.props;

    if (!showCancel) {
      return null;
    }

    return cancelDisabled ? (
      <Tooltip title={t('notEnoughGas')} position="bottom">
        <div>
          <Button
            type="raised"
            onClick={this.handleCancel}
            className="transaction-list-item-details__header-button"
            disabled
          >
            {t('cancel')}
          </Button>
        </div>
      </Tooltip>
    ) : (
      <Button
        type="raised"
        onClick={this.handleCancel}
        className="transaction-list-item-details__header-button"
      >
        {t('cancel')}
      </Button>
    );
  }

  render() {
    const { t } = this.context;
    const { justCopied } = this.state;
    const {
      transactionGroup,
      primaryCurrency,
      showSpeedUp,
      showRetry,
      recipientEns,
      recipientAddress,
      rpcPrefs: { blockExplorerUrl } = {},
      senderAddress,
      isEarliestNonce,
      senderNickname,
      title,
      onClose,
      recipientNickname,
      nativeCurrency,
      secondaryCurrency,
    } = this.props;
    const {
      primaryTransaction: transaction,
      initialTransaction: { type },
    } = transactionGroup;
    const {
      txParams: { gas, gasPrice, value, data } = {},
      txReceipt: { gasUsed } = {},
      hash,
      origin,
      type: transactionType,
    } = transaction;
    const gasLimit = typeof gasUsed === 'string' ? gasUsed : gas;
    const hexGasTotal =
      (gasLimit && gasPrice && getHexGasTotal({ gasLimit, gasPrice })) || '0x0';
    const totalInHex = sumHexes(hexGasTotal, value);
    console.log(this, 'this');
    let isNFTTransaction = false;
    let nftToAddress = '';
    let nftSendNumber = '';
    if (origin === 'metamask' && transactionType === 'contractInteraction') {
      isNFTTransaction = true;
      nftToAddress = `0x${shortenAddress(data?.substr(98, 40))}`;
      if (data.length > 400) {
        nftSendNumber = parseInt(`0x${data?.substr(202, 64)}`, 16);
      } else {
        nftSendNumber = 1;
      }
    }
    return (
      <Popover
        title={title}
        onClose={onClose}
        header={
          <div className="page-container-header">
            <img
              onClick={onClose}
              className="return"
              src="./images/return.png"
            />
            <div className="content">
              {this.context.t('transactionDetails')}
            </div>
          </div>
        }
        className="an"
      >
        <div className="rs-popover-content">
          <div className="rs-popover-states">{title}</div>
          <div className="rs-popover-li">
            <span>{this.context.t('from')}</span>
            <div>
              {senderNickname ||
                shortenAddress(toChecksumHexAddress(senderAddress))}
            </div>
          </div>
          <div className="rs-popover-li">
            <span>{this.context.t('to')}</span>
            <div>
              {nftToAddress ||
                recipientNickname ||
                recipientEns ||
                shortenAddress(toChecksumHexAddress(recipientAddress))}
            </div>
          </div>
          <div className="rs-popover-li">
            <span>{this.context.t('number')}</span>
            <div>{nftSendNumber || primaryCurrency}</div>
          </div>
          <div className="rs-popover-li">
            <span>{this.context.t('transaction')}ID</span>
            <div>
              {transaction.hash ? shortenAddress(transaction.hash) : ''}
              <img
                onClick={this.handleBlockExplorerClick}
                src="./images/share.png"
              />
              <Tooltip
                position="bottom"
                title={
                  justCopied
                    ? this.context.t('copiedExclamation')
                    : this.context.t('copyToClipboard')
                }
              >
                <img onClick={this.handleCopyTxId} src="./images/copy2.png" />
              </Tooltip>
            </div>
          </div>
          <div className="rs-popover-li">
            <span>Nonce</span>
            <div>
              {parseInt(transactionGroup.initialTransaction.txParams.nonce)}
            </div>
          </div>

          <div className="rs-popover-li">
            <span>
              {this.context.t('transactionFeeLimit')}(GasLimit) (
              {this.context.t('units')})
            </span>
            <div>{hexToDecimal(gas)}</div>
          </div>
          <div className="rs-popover-li">
            <span>{this.context.t('transactionFee')}(GWEI)</span>
            <div>
              <CurrencyDisplay
                className="transaction-breakdown__value"
                data-testid="transaction-breakdown__gas-price"
                currency={nativeCurrency}
                denomination={GWEI}
                value={gasPrice}
                hideLabel
                isCustom
              />
            </div>
          </div>
          <div className="rs-popover-li">
            <span>{this.context.t('total')}</span>
            <div>
              <UserPreferencedCurrencyDisplay
                className="transaction-breakdown__value transaction-breakdown__value--eth-total"
                type={PRIMARY}
                value={totalInHex}
              />
            </div>
          </div>
          <div className="rs-popover-li">
            <div>{secondaryCurrency}</div>
          </div>
        </div>
        <TransactionActivityLog
          transactionGroup={transactionGroup}
          className="transaction-list-item-details__transaction-activity-log"
          onCancel={this.handleCancel}
          onRetry={this.handleRetry}
          isEarliestNonce={isEarliestNonce}
        />
        {/* <div className="transaction-list-item-details">
          <div className="transaction-list-item-details__header">
            <div>{t('details')}</div>
            <div className="transaction-list-item-details__header-buttons">
              {showSpeedUp && (
                <Button
                  type="raised"
                  onClick={this.handleRetry}
                  className="transaction-list-item-details__header-button"
                >
                  {t('speedUp')}
                </Button>
              )}
              {this.renderCancel()}
              <Tooltip
                wrapperClassName="transaction-list-item-details__header-button"
                containerClassName="transaction-list-item-details__header-button-tooltip-container"
                title={
                  justCopied ? t('copiedTransactionId') : t('copyTransactionId')
                }
              >
                <Button
                  type="raised"
                  onClick={this.handleCopyTxId}
                  disabled={!hash}
                >
                  <Copy size={10} color="#3098DC" />
                </Button>
              </Tooltip>
              <Tooltip
                wrapperClassName="transaction-list-item-details__header-button"
                containerClassName="transaction-list-item-details__header-button-tooltip-container"
                title={
                  blockExplorerUrl
                    ? t('viewOnCustomBlockExplorer', [blockExplorerUrl])
                    : t('viewOnEtherscan')
                }
              >
                <Button
                  type="raised"
                  onClick={this.handleBlockExplorerClick}
                  disabled={!hash}
                >
                  <img src="./images/arrow-popout.svg" alt="" />
                </Button>
              </Tooltip>
              {showRetry && (
                <Tooltip title={t('retryTransaction')}>
                  <Button
                    type="raised"
                    onClick={this.handleRetry}
                    className="transaction-list-item-details__header-button"
                  >
                    <i className="fa fa-sync"></i>
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="transaction-list-item-details__body">
            <div className="transaction-list-item-details__sender-to-recipient-container">
              <SenderToRecipient
                warnUserOnAccountMismatch={false}
                variant={FLAT_VARIANT}
                addressOnly
                recipientEns={recipientEns}
                recipientAddress={recipientAddress}
                recipientNickname={recipientNickname}
                senderName={senderNickname}
                senderAddress={senderAddress}
                onRecipientClick={() => {
                  this.context.metricsEvent({
                    eventOpts: {
                      category: 'Navigation',
                      action: 'Activity Log',
                      name: 'Copied "To" Address',
                    },
                  });
                }}
                onSenderClick={() => {
                  this.context.metricsEvent({
                    eventOpts: {
                      category: 'Navigation',
                      action: 'Activity Log',
                      name: 'Copied "From" Address',
                    },
                  });
                }}
              />
            </div>
            <div className="transaction-list-item-details__cards-container">
              <TransactionBreakdown
                nonce={transactionGroup.initialTransaction.txParams.nonce}
                isTokenApprove={type === TRANSACTION_TYPES.TOKEN_METHOD_APPROVE}
                transaction={transaction}
                primaryCurrency={primaryCurrency}
                className="transaction-list-item-details__transaction-breakdown"
              />
              <TransactionActivityLog
                transactionGroup={transactionGroup}
                className="transaction-list-item-details__transaction-activity-log"
                onCancel={this.handleCancel}
                onRetry={this.handleRetry}
                isEarliestNonce={isEarliestNonce}
              />
            </div>
          </div>
        </div> */}
      </Popover>
    );
  }
}
