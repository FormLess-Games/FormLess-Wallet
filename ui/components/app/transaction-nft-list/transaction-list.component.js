import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  nonceSortedCompletedTransactionsSelector,
  nonceSortedPendingTransactionsSelector,
} from '../../../selectors/transactions';
import {
  getCurrentChainId,
  getAccountNFTTokens,
  getSelectedAddress,
} from '../../../selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import TransactionListItem from '../transaction-nft-list-item';
import Button from '../../ui/button';
import { TOKEN_CATEGORY_HASH } from '../../../helpers/constants/transactions';
import { SWAPS_CHAINID_CONTRACT_ADDRESS_MAP } from '../../../../shared/constants/swaps';
import { TRANSACTION_TYPES } from '../../../../shared/constants/transaction';

const PAGE_INCREMENT = 10;

// When we are on a token page, we only want to show transactions that involve that token.
// In the case of token transfers or approvals, these will be transactions sent to the
// token contract. In the case of swaps, these will be transactions sent to the swaps contract
// and which have the token address in the transaction data.
//
// getTransactionGroupRecipientAddressFilter is used to determine whether a transaction matches
// either of those criteria
const getTransactionGroupRecipientAddressFilter = (
  recipientAddress,
  chainId,
) => {
  return ({ initialTransaction: { txParams } }) => {
    return (
      txParams?.to === recipientAddress ||
      (txParams?.to === SWAPS_CHAINID_CONTRACT_ADDRESS_MAP[chainId] &&
        txParams.data.match(recipientAddress.slice(2)))
    );
  };
};

const tokenTransactionFilter = ({
  initialTransaction: { type, destinationTokenSymbol, sourceTokenSymbol },
}) => {
  if (TOKEN_CATEGORY_HASH[type]) {
    return false;
  } else if (type === TRANSACTION_TYPES.SWAP) {
    return destinationTokenSymbol === 'ETH' || sourceTokenSymbol === 'ETH';
  }
  return true;
};

const getFilteredTransactionGroups = (
  transactionGroups,
  hideTokenTransactions,
  tokenAddress,
  chainId,
) => {
  if (hideTokenTransactions) {
    return transactionGroups.filter(tokenTransactionFilter);
  } else if (tokenAddress) {
    return transactionGroups.filter(
      getTransactionGroupRecipientAddressFilter(tokenAddress, chainId),
    );
  }
  return transactionGroups;
};

export default function TransactionList({
  isNFT,
  hideTokenTransactions,
  tokenAddress,
  header,
  useContractAddress,
  useTokenId,
}) {
  const [limit, setLimit] = useState(PAGE_INCREMENT);
  const t = useI18nContext();
  const accountNFTTokens = useSelector(getAccountNFTTokens);

  const selectedAddress = useSelector(getSelectedAddress);
  const unfilteredPendingTransactions = useSelector(
    nonceSortedPendingTransactionsSelector,
  );
  const unfilteredCompletedTransactions = useSelector(
    nonceSortedCompletedTransactionsSelector,
  );
  const chainId = useSelector(getCurrentChainId);
  const nftList = accountNFTTokens?.[selectedAddress]?.[chainId];

  const pendingTransactions = useMemo(
    () =>
      getFilteredTransactionGroups(
        unfilteredPendingTransactions,
        hideTokenTransactions,
        tokenAddress,
        chainId,
      )
        .filter((item, index) => {
          const tokenId = parseInt(
            `0x${item.initialTransaction.txParams.data?.substr(138)}`,
            16,
          );
          const tokenId2 = parseInt(
            `0x${item.initialTransaction.txParams.data?.substr(138, 64)}`,
            16,
          );
          const contractAddress = item.initialTransaction.txParams.to;
          const key = `${contractAddress}${tokenId}`;
          const key2 = `${contractAddress}${tokenId2}`;

          const list = nftList?.find(
            (item) =>
              `${item.contractAddress}${item.tokenId}` === key ||
              `${item.contractAddress}${item.tokenId}` === key2,
          );
          console.log(list, tokenId, contractAddress, item, 'xxxxxx----');
          return list;
        })
        .filter((item) => {
          if (useContractAddress) {
            const tokenId = parseInt(
              `0x${item.initialTransaction.txParams.data?.substr(138)}`,
              16,
            );
            const tokenId2 = parseInt(
              `0x${item.initialTransaction.txParams.data?.substr(138, 64)}`,
              16,
            );
            const contractAddress = item.initialTransaction.txParams.to;
            return (
              `${useContractAddress}${useTokenId}` ===
                `${contractAddress}${tokenId}` ||
              `${useContractAddress}${useTokenId}` ===
                `${contractAddress}${tokenId2}`
            );
          }
          return true;
        }),
    [
      hideTokenTransactions,
      tokenAddress,
      unfilteredPendingTransactions,
      chainId,
    ],
  );
  const completedTransactions = useMemo(
    () =>
      getFilteredTransactionGroups(
        unfilteredCompletedTransactions,
        hideTokenTransactions,
        tokenAddress,
        chainId,
      )
        .filter((item, index) => {
          const tokenId = parseInt(
            `0x${item.initialTransaction.txParams.data?.substr(138)}`,
            16,
          );
          const tokenId2 = parseInt(
            `0x${item.initialTransaction.txParams.data?.substr(138, 64)}`,
            16,
          );
          const contractAddress = item.initialTransaction.txParams.to;
          const key = `${contractAddress}${tokenId}`;
          const key2 = `${contractAddress}${tokenId2}`;
          const list = nftList?.find(
            (item) =>
              `${item.contractAddress}${item.tokenId}` === key ||
              `${item.contractAddress}${item.tokenId}` === key2,
          );
          return list;
        })
        .filter((item) => {
          if (useContractAddress) {
            const tokenId = parseInt(
              `0x${item.initialTransaction.txParams.data?.substr(138)}`,
              16,
            );
            const tokenId2 = parseInt(
              `0x${item.initialTransaction.txParams.data?.substr(138, 64)}`,
              16,
            );
            const contractAddress = item.initialTransaction.txParams.to;
            return (
              `${useContractAddress}${useTokenId}` ===
                `${contractAddress}${tokenId}` ||
              `${useContractAddress}${useTokenId}` ===
                `${contractAddress}${tokenId2}`
            );
          }
          return true;
        }),
    [
      hideTokenTransactions,
      tokenAddress,
      unfilteredCompletedTransactions,
      chainId,
    ],
  );

  const viewMore = useCallback(
    () => setLimit((prev) => prev + PAGE_INCREMENT),
    [],
  );

  const pendingLength = pendingTransactions.length;
  console.log(completedTransactions);
  return (
    <div className="transaction-list">
      <div className={`${isNFT ? 'an' : ''} transaction-list__transactions`}>
        {pendingLength > 0 && (
          <div className="transaction-list__pending-transactions">
            <div className="transaction-list__header">
              {`${t('queue')} (${pendingTransactions.length})`}
            </div>
            <div className="rs-nft-trade">
              {pendingTransactions.map((transactionGroup, index) => (
                <TransactionListItem
                  isEarliestNonce={index === 0}
                  transactionGroup={transactionGroup}
                  key={`${transactionGroup.nonce}:${index}`}
                />
              ))}
            </div>
          </div>
        )}
        {header && (
          <div className="transaction-list__completed-transactions-header">
            {t('transHistory')}
          </div>
        )}
        <div className="transaction-list__completed-transactions">
          {completedTransactions.length > 0 ? (
            <div className="rs-nft-trade">
              {completedTransactions
                .slice(0, limit)
                .map((transactionGroup, index) => (
                  <TransactionListItem
                    transactionGroup={transactionGroup}
                    key={`${transactionGroup.nonce}:${limit + index - 10}`}
                  />
                ))}
            </div>
          ) : (
            <div className="transaction-list__empty">
              <div className="transaction-list__empty-text">
                {t('noTransactions')}
              </div>
            </div>
          )}
          {completedTransactions.length > limit && (
            <Button
              className="transaction-list__view-more"
              type="secondary"
              rounded
              onClick={viewMore}
            >
              {t('viewMore')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

TransactionList.propTypes = {
  hideTokenTransactions: PropTypes.bool,
  tokenAddress: PropTypes.string,
};

TransactionList.defaultProps = {
  hideTokenTransactions: false,
  tokenAddress: undefined,
};
