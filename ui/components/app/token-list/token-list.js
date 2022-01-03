import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

import { useSelector } from 'react-redux';
import TokenCell from '../token-cell';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTokenTracker } from '../../../hooks/useTokenTracker';
import {
  getAssetImages,
  getShouldHideZeroBalanceTokens,
  getIndexSort,
} from '../../../selectors';
import { getTokens } from '../../../ducks/metamask/metamask';
import { INDEX_SORT } from '../../../../shared/constants/app';
import { useTokenFiatAmountFunc } from '../../../hooks/useTokenFiatAmountFunc';

export default function TokenList({ onTokenClick }) {
  const t = useI18nContext();
  const assetImages = useSelector(getAssetImages);
  const indexSort = useSelector(getIndexSort);
  const getTokenFiatAmountFunc = useTokenFiatAmountFunc();
  console.log('indexSort', indexSort);
  const shouldHideZeroBalanceTokens = useSelector(
    getShouldHideZeroBalanceTokens,
  );
  // use `isEqual` comparison function because the token array is serialized
  // from the background so it has a new reference with each background update,
  // even if the tokens haven't changed
  const tokens = useSelector(getTokens, isEqual);
  const { loading, tokensWithBalances } = useTokenTracker(
    tokens,
    true,
    shouldHideZeroBalanceTokens,
  );

  const [sortList, setSortList] = useState([]);
  useEffect(() => {
    if (!loading) {
      let list = [...tokensWithBalances];
      // a -> z
      if (indexSort === INDEX_SORT.NAME) {
        list.sort((a, b) => a.symbol.charCodeAt(0) - b.symbol.charCodeAt(0));
      } else if (indexSort === INDEX_SORT.NET_VALUE) {
        list = list.map((tokenData) => {
          return {
            ...tokenData,
            formattedFiatBigNumber: getTokenFiatAmountFunc(
              tokenData.address,
              tokenData.string,
              tokenData.symbol,
              {},
              false,
              true,
            ),
          };
        });
        list.sort((a, b) => {
          if (!a.formattedFiatBigNumber || !b.formattedFiatBigNumber) {
            return 0;
          }
          return a.formattedFiatBigNumber.lt(b.formattedFiatBigNumber) ? 1 : -1;
        });
      }

      setSortList(list);
    }
  }, [loading, tokensWithBalances, indexSort, getTokenFiatAmountFunc]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '250px',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
        }}
      >
        {t('loadingTokens')}
      </div>
    );
  }

  return (
    <div>
      {sortList.map((tokenData, index) => {
        tokenData.image = assetImages[tokenData.address];
        return <TokenCell key={index} {...tokenData} onClick={onTokenClick} />;
      })}
    </div>
  );
}

TokenList.propTypes = {
  onTokenClick: PropTypes.func.isRequired,
};
