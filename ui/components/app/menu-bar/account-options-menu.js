import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import { getAccountLink } from '@metamask/etherscan-link';

import { showModal } from '../../../store/actions';
import {
  CONNECTED_ROUTE,
  REVEAL_SEED_ROUTE,
} from '../../../helpers/constants/routes';
import { Menu, MenuItem } from '../../ui/menu';
import {
  // getCurrentChainId,
  getCurrentKeyring,
  // getRpcPrefsForCurrentProvider,
  // getSelectedIdentity,
} from '../../../selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  useMetricEvent,
  // useNewMetricEvent,
} from '../../../hooks/useMetricEvent';
// import { getEnvironmentType } from '../../../../app/scripts/lib/util';
// import { ENVIRONMENT_TYPE_FULLSCREEN } from '../../../../shared/constants/app';

export default function AccountOptionsMenu({ anchorElement, onClose }) {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const keyring = useSelector(getCurrentKeyring);
  // const chainId = useSelector(getCurrentChainId);
  // const rpcPrefs = useSelector(getRpcPrefsForCurrentProvider);
  // const selectedIdentity = useSelector(getSelectedIdentity);
  // const { address } = selectedIdentity;
  // const addressLink = getAccountLink(address, chainId, rpcPrefs);

  const isExport = useMemo(() => {
    if (keyring) {
      const { type } = keyring;
      switch (type) {
        case 'Trezor Hardware':
        case 'Ledger Hardware':
        case 'Simple Key Pair':
          return false;
        default:
          return true;
      }
    }
    return true;
  }, [keyring]);
  console.log(keyring, 'keyringkeyringkeyring');

  // const openFullscreenEvent = useMetricEvent({
  //   eventOpts: {
  //     category: 'Navigation',
  //     action: 'Account Options',
  //     name: 'Clicked Expand View',
  //   },
  // });
  // const viewAccountDetailsEvent = useMetricEvent({
  //   eventOpts: {
  //     category: 'Navigation',
  //     action: 'Account Options',
  //     name: 'Viewed Account Details',
  //   },
  // });

  const openConnectedSitesEvent = useMetricEvent({
    eventOpts: {
      category: 'Navigation',
      action: 'Account Options',
      name: 'Opened Connected Sites',
    },
  });

  // const blockExplorerLinkClickedEvent = useNewMetricEvent({
  //   category: 'Navigation',
  //   event: 'Clicked Block Explorer Link',
  //   properties: {
  //     link_type: 'Account Tracker',
  //     action: 'Account Options',
  //     block_explorer_domain: addressLink ? new URL(addressLink)?.hostname : '',
  //   },
  // });

  // const isRemovable = keyring.type !== 'HD Key Tree';

  return (
    <Menu
      anchorElement={anchorElement}
      className="account-options-menu"
      onHide={onClose}
    >
      <MenuItem
        onClick={() => {
          dispatch(showModal({ name: 'ACCOUNT_DETAILS' }));
          onClose();
        }}
      >
        <img src="./images/menu1.png" />
        {t('walletDetail')}
      </MenuItem>
      {isExport && (
        <MenuItem
          data-testid="account-options-menu__account-details"
          onClick={() => {
            history.push(REVEAL_SEED_ROUTE);
            onClose();
          }}
        >
          <img src="./images/menu2.png" />
          {t('exportAccountWords')}
        </MenuItem>
      )}
      <MenuItem
        onClick={() => {
          dispatch(showModal({ name: 'EXPORT_PRIVATE_KEY' }));
          onClose();
        }}
      >
        <img src="./images/menu3.png" />
        {t('exportPrivateKey')}
      </MenuItem>
      <MenuItem
        data-testid="account-options-menu__connected-sites"
        onClick={() => {
          openConnectedSitesEvent();
          history.push(CONNECTED_ROUTE);
          onClose();
        }}
      >
        <img src="./images/menu4.png" />
        {t('connectedSites')}
      </MenuItem>
    </Menu>
  );
}

AccountOptionsMenu.propTypes = {
  anchorElement: PropTypes.instanceOf(window.Element),
  onClose: PropTypes.func.isRequired,
};

AccountOptionsMenu.defaultProps = {
  anchorElement: undefined,
};
