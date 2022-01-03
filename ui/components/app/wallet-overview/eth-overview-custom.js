import React from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';

import UserPreferencedCurrencyDisplay from '../user-preferenced-currency-display';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';

import {
  isBalanceCached,
  getSelectedAccount,
  getShouldShowFiat,
} from '../../../selectors/selectors';

const EthOverviewCustom = () => {
  const balanceIsCached = useSelector(isBalanceCached);
  const showFiat = useSelector(getShouldShowFiat);
  const selectedAccount = useSelector(getSelectedAccount);
  const { balance } = selectedAccount;

  return (
    <>
      <UserPreferencedCurrencyDisplay
        className={classnames('eth-overview__primary-balance', {
          'eth-overview__cached-balance': balanceIsCached,
        })}
        data-testid="eth-overview__primary-currency"
        value={balance}
        type={PRIMARY}
        ethNumberOfDecimals={4}
        hideTitle
      />
      {showFiat && (
        <UserPreferencedCurrencyDisplay
          className={classnames({
            'eth-overview__cached-secondary-balance': balanceIsCached,
            'eth-overview__secondary-balance': !balanceIsCached,
            'eth-overview__fiat-wrap': true,
          })}
          data-testid="eth-overview__secondary-currency"
          value={balance}
          type={SECONDARY}
          ethNumberOfDecimals={4}
          hideTitle
        />
      )}
    </>
  );
};

export default EthOverviewCustom;
