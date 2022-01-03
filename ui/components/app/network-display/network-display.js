import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import {
  NETWORK_TYPE_RPC,
  NETWORK_TYPE_TO_ID_MAP,
} from '../../../../shared/constants/network';

import LoadingIndicator from '../../ui/loading-indicator';
import ColorIndicator from '../../ui/color-indicator';
import {
  COLORS,
  SIZES,
  TYPOGRAPHY,
} from '../../../helpers/constants/design-system';
import Chip from '../../ui/chip/chip';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { isNetworkLoading } from '../../../selectors';

export default function NetworkDisplay({
  colored,
  outline,
  iconClassName,
  indicatorSize,
  disabled,
  labelProps,
  targetNetwork,
  onClick,
}) {
  const networkIsLoading = useSelector(isNetworkLoading);
  const currentNetwork = useSelector((state) => ({
    nickname: state.metamask.provider.nickname,
    type: state.metamask.provider.type,
  }));
  const t = useI18nContext();

  const { nickname: networkNickname, type: networkType } =
    targetNetwork ?? currentNetwork;

  return (
    <Chip
      borderColor={outline ? COLORS.UI3 : COLORS.TRANSPARENT}
      onClick={onClick}
      rightIcon={
        iconClassName && (
          <img className="header-down" src="./images/down2.png" />
        )
      }
      label={
        networkType === NETWORK_TYPE_RPC
          ? networkNickname ?? t('privateNetwork')
          : t(networkType)
      }
      className={classnames('network-display', {
        'network-display--colored': colored,
        'network-display--disabled': disabled,
        [`network-display--${networkType}`]: colored && networkType,
      })}
      labelProps={{
        variant: TYPOGRAPHY.H7,
        ...labelProps,
      }}
    />
  );
}
NetworkDisplay.propTypes = {
  colored: PropTypes.bool,
  indicatorSize: PropTypes.oneOf(Object.values(SIZES)),
  labelProps: Chip.propTypes.labelProps,
  targetNetwork: PropTypes.shape({
    type: PropTypes.oneOf([
      ...Object.values(NETWORK_TYPE_TO_ID_MAP),
      NETWORK_TYPE_RPC,
    ]),
    nickname: PropTypes.string,
  }),
  outline: PropTypes.bool,
  disabled: PropTypes.bool,
  iconClassName: PropTypes.string,
  onClick: PropTypes.func,
};

NetworkDisplay.defaultProps = {
  colored: true,
  indicatorSize: SIZES.LG,
};
