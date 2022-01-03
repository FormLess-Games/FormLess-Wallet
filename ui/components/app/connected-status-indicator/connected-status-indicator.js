import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { findKey } from 'lodash';
import {
  STATUS_CONNECTED,
  STATUS_CONNECTED_TO_ANOTHER_ACCOUNT,
  STATUS_NOT_CONNECTED,
} from '../../../helpers/constants/connected-sites';
import ColorIndicator from '../../ui/color-indicator';
import { COLORS } from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  getAddressConnectedDomainMap,
  getOriginOfCurrentTab,
  getSelectedAddress,
} from '../../../selectors';

export default function ConnectedStatusIndicator({ onClick }) {
  const t = useI18nContext();

  const selectedAddress = useSelector(getSelectedAddress);
  const addressConnectedDomainMap = useSelector(getAddressConnectedDomainMap);
  const originOfCurrentTab = useSelector(getOriginOfCurrentTab);

  const selectedAddressDomainMap = addressConnectedDomainMap[selectedAddress];
  const currentTabIsConnectedToSelectedAddress = Boolean(
    selectedAddressDomainMap && selectedAddressDomainMap[originOfCurrentTab],
  );
  let status;
  if (currentTabIsConnectedToSelectedAddress) {
    status = STATUS_CONNECTED;
  } else if (findKey(addressConnectedDomainMap, originOfCurrentTab)) {
    status = STATUS_CONNECTED_TO_ANOTHER_ACCOUNT;
  } else {
    status = STATUS_NOT_CONNECTED;
  }

  let indicatorType = ColorIndicator.TYPES.OUTLINE;
  let indicatorColor = COLORS.UI4;

  if (status === STATUS_CONNECTED) {
    indicatorColor = COLORS.SUCCESS1;
    indicatorType = ColorIndicator.TYPES.PARTIAL;
  } else if (status === STATUS_CONNECTED_TO_ANOTHER_ACCOUNT) {
    indicatorColor = COLORS.ALERT1;
  }

  return <ColorIndicator color={indicatorColor} type={indicatorType} />;
}

ConnectedStatusIndicator.defaultProps = {
  onClick: undefined,
};

ConnectedStatusIndicator.propTypes = {
  onClick: PropTypes.func,
};
