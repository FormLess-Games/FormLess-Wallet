import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useHistory } from 'react-router-dom';
import ListItem from '../../ui/list-item';
import { useSelector } from 'react-redux';
import { useTransactionDisplayData } from '../../../hooks/useTransactionDisplayData';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useCancelTransaction } from '../../../hooks/useCancelTransaction';
import { useRetryTransaction } from '../../../hooks/useRetryTransaction';
import Button from '../../ui/button';
import Tooltip from '../../ui/tooltip';
import TransactionListItemDetails from '../transaction-list-item-details';
import { CONFIRM_TRANSACTION_ROUTE } from '../../../helpers/constants/routes';
import { useShouldShowSpeedUp } from '../../../hooks/useShouldShowSpeedUp';
import TransactionStatus from '../transaction-status/transaction-status.component';
import TransactionIcon from '../transaction-icon';
import {
  TRANSACTION_GROUP_CATEGORIES,
  TRANSACTION_STATUSES,
} from '../../../../shared/constants/transaction';
import {
  getCurrentChainId,
  getAccountNFTTokens,
  getSelectedAddress,
} from '../../../selectors';
import { shortenAddress } from '../../../helpers/utils/util';

export default function TransactionListItem({
  transactionGroup,
  isEarliestNonce = false,
}) {
  const t = useI18nContext();
  const history = useHistory();
  const { hasCancelled } = transactionGroup;
  const [showDetails, setShowDetails] = useState(false);
  const accountNFTTokens = useSelector(getAccountNFTTokens);
  const chainId = useSelector(getCurrentChainId);
  const selectedAddress = useSelector(getSelectedAddress);
  const {
    initialTransaction: { id },
    primaryTransaction: { err, status },
  } = transactionGroup;
  const [cancelEnabled, cancelTransaction] = useCancelTransaction(
    transactionGroup,
  );
  const retryTransaction = useRetryTransaction(transactionGroup);
  const shouldShowSpeedUp = useShouldShowSpeedUp(
    transactionGroup,
    isEarliestNonce,
  );

  const {
    title,
    subtitle,
    subtitleContainsOrigin,
    date,
    category,
    primaryCurrency,
    recipientAddress,
    secondaryCurrency,
    displayedStatusKey,
    isPending,
    senderAddress,
  } = useTransactionDisplayData(transactionGroup);

  const isSignatureReq =
    category === TRANSACTION_GROUP_CATEGORIES.SIGNATURE_REQUEST;
  const isApproval = category === TRANSACTION_GROUP_CATEGORIES.APPROVAL;
  const isUnapproved = status === TRANSACTION_STATUSES.UNAPPROVED;
  const isSwap = category === TRANSACTION_GROUP_CATEGORIES.SWAP;

  const className = classnames('transaction-list-item', {
    'transaction-list-item--unconfirmed':
      isPending ||
      [
        TRANSACTION_STATUSES.FAILED,
        TRANSACTION_STATUSES.DROPPED,
        TRANSACTION_STATUSES.REJECTED,
      ].includes(displayedStatusKey),
  });

  const toggleShowDetails = useCallback(() => {
    if (isUnapproved) {
      history.push(`${CONFIRM_TRANSACTION_ROUTE}/${id}`);
      return;
    }
    setShowDetails((prev) => !prev);
  }, [isUnapproved, history, id]);

  const formatDate = (date) => {
    date = new Date(date);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var m1 = date.getMinutes();
    var s = date.getSeconds();
    m = m < 10 ? '0' + m : m;
    d = d < 10 ? '0' + d : d;
    return y + '-' + m + '-' + d + ' ' + h + ':' + m1 + ':' + s;
  };

  const cancelButton = useMemo(() => {
    const btn = (
      <Button
        onClick={cancelTransaction}
        rounded
        className="transaction-list-item__header-button"
        disabled={!cancelEnabled}
      >
        {t('cancel')}
      </Button>
    );
    if (hasCancelled || !isPending || isUnapproved) {
      return null;
    }

    return cancelEnabled ? (
      btn
    ) : (
      <Tooltip title={t('notEnoughGas')} position="bottom">
        <div>{btn}</div>
      </Tooltip>
    );
  }, [
    isPending,
    t,
    isUnapproved,
    cancelEnabled,
    cancelTransaction,
    hasCancelled,
  ]);

  const speedUpButton = useMemo(() => {
    if (!shouldShowSpeedUp || !isPending || isUnapproved) {
      return null;
    }
    return (
      <Button
        type="secondary"
        rounded
        onClick={hasCancelled ? cancelTransaction : retryTransaction}
        style={hasCancelled ? { width: 'auto' } : null}
      >
        {hasCancelled ? t('speedUpCancellation') : t('speedUp')}
      </Button>
    );
  }, [
    shouldShowSpeedUp,
    isUnapproved,
    t,
    isPending,
    retryTransaction,
    hasCancelled,
    cancelTransaction,
  ]);
  const nftList = accountNFTTokens?.[selectedAddress]?.[chainId];
  const tokenId = parseInt(
    `0x${transactionGroup.initialTransaction.txParams.data?.substr(138)}`,
    16,
  );
  const tokenId2 = parseInt(
    `0x${transactionGroup.initialTransaction.txParams.data?.substr(138, 64)}`,
    16,
  );
  const to = transactionGroup.initialTransaction.txParams.data?.substr(98, 40);
  const contractAddress = transactionGroup.initialTransaction.txParams.to;
  const nftInfo = nftList?.find(
    (item) =>
      `${item.contractAddress}${item.tokenId}` ===
        `${contractAddress}${tokenId}` ||
      `${item.contractAddress}${item.tokenId}` ===
        `${contractAddress}${tokenId2}`,
  );
  console.log(
    category,
    displayedStatusKey,
    transactionGroup,
    'categorycategorycategory',
    nftList,
  );

  return (
    <>
      <div className="rs-nft-trade-li" onClick={() => toggleShowDetails()}>
        <div className="trade-top">
          <div className="type">{title}</div>
          <img src={nftInfo?.originalImage} />
        </div>
        <div className="trade-bot">
          <div className="path">
            {t('to')}：{shortenAddress(to)}
          </div>
          <div className="time">
            {formatDate(transactionGroup.initialTransaction.time)}
          </div>
        </div>
        <div className="transaction-list-item__pending-actions">
          {speedUpButton}
          {cancelButton}
        </div>
      </div>
      {/* <ListItem
        type="transaction"
        onClick={toggleShowDetails}
        className={className}
        title={title}
        icon={
          <TransactionIcon category={category} status={displayedStatusKey} />
        }
        status={{ category, displayedStatusKey }}
        subtitleContent={subtitle}
        primaryCurrency={primaryCurrency}
        subtitle={
          <h3>
            <TransactionStatus
              isPending={isPending}
              isEarliestNonce={isEarliestNonce}
              error={err}
              date={date}
              status={displayedStatusKey}
            />
            <span
              className={
                subtitleContainsOrigin
                  ? 'transaction-list-item__origin'
                  : 'transaction-list-item__address'
              }
              title={subtitle}
            >
              {subtitle}
            </span>
          </h3>
        }
        rightContent={
          !isSignatureReq &&
          !isApproval && (
            <>
              <h2
                title={primaryCurrency}
                className="transaction-list-item__primary-currency"
              >
                {primaryCurrency}
              </h2>
              <h3 className="transaction-list-item__secondary-currency">
                {secondaryCurrency}
              </h3>
            </>
          )
        }
      >
        <div className="transaction-list-item__pending-actions">
          {speedUpButton}
          {cancelButton}
        </div>
      </ListItem> */}
      {showDetails && (
        <TransactionListItemDetails
          title={title}
          onClose={toggleShowDetails}
          transactionGroup={transactionGroup}
          primaryCurrency={primaryCurrency}
          senderAddress={senderAddress}
          recipientAddress={recipientAddress}
          onRetry={retryTransaction}
          showRetry={status === TRANSACTION_STATUSES.FAILED && !isSwap}
          showSpeedUp={shouldShowSpeedUp}
          isEarliestNonce={isEarliestNonce}
          onCancel={cancelTransaction}
          showCancel={isPending && !hasCancelled}
          cancelDisabled={!cancelEnabled}
        />
      )}
    </>
  );
}

TransactionListItem.propTypes = {
  transactionGroup: PropTypes.object.isRequired,
  isEarliestNonce: PropTypes.bool,
};
