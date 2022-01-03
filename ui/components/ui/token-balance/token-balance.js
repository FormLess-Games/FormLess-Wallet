import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import CurrencyDisplay from '../currency-display';
import { useTokenTracker } from '../../../hooks/useTokenTracker';

export default function TokenBalance({
  isCustom,
  className,
  token,
  handleSetBalance,
}) {
  const { tokensWithBalances } = useTokenTracker([token]);

  const { string, symbol } = tokensWithBalances[0] || {};

  useEffect(() => {
    if (string) {
      handleSetBalance && handleSetBalance(string);
    }
  }, [string]);

  return (
    <CurrencyDisplay
      isCustom
      className={className}
      displayValue={string || ''}
      suffix={symbol || ''}
    />
  );
}

TokenBalance.propTypes = {
  className: PropTypes.string,
  token: PropTypes.shape({
    address: PropTypes.string.isRequired,
    decimals: PropTypes.number,
    symbol: PropTypes.string,
  }).isRequired,
};

TokenBalance.defaultProps = {
  className: undefined,
};
