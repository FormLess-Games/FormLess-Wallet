import { connect } from 'react-redux';
import {
  accountsWithSendEtherInfoSelector,
  getAddressBookEntry,
  getIsEthGasPriceFetched,
  getNoGasPriceFetched,
  getAddressBook,
  getSelectedIdentity,
} from '../../../selectors';
import { useTokenTracker } from '../../../hooks/useTokenTracker';

import {
  getIsAssetSendable,
  getSendTo,
  getSendAsset,
  getSendAmount,
  ASSET_TYPES,
} from '../../../ducks/send';

import * as actions from '../../../store/actions';
import SendContent from './send-content.component';

function mapStateToProps(state) {
  const ownedAccounts = accountsWithSendEtherInfoSelector(state);
  const to = getSendTo(state);
  const selectedAccountName = getSelectedIdentity(state).name;
  const asset = getSendAsset(state);
  let tokensBalances = '';
  if (asset.type === ASSET_TYPES.TOKEN && asset.details?.address) {
    // const { tokensWithBalances } = useTokenTracker([asset.details]);
    //   const { string } = tokensWithBalances[0] || {};
    //   tokensBalances = string;
  }
  return {
    amount: getSendAmount(state),
    asset,
    tokensBalances,
    isAssetSendable: getIsAssetSendable(state),
    isOwnedAccount: Boolean(
      ownedAccounts.find(
        ({ address }) => address.toLowerCase() === to.toLowerCase(),
      ),
    ),
    contact: getAddressBookEntry(state, to),
    isEthGasPrice: getIsEthGasPriceFetched(state),
    noGasPrice: getNoGasPriceFetched(state),
    to,
    addressBook: getAddressBook(state),
    selectedAccountName,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showAddToAddressBookModal: (recipient) =>
      dispatch(
        actions.showModal({
          name: 'ADD_TO_ADDRESSBOOK',
          recipient,
        }),
      ),
    showQrScanner: () => dispatch(actions.showQrScanner()),
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { to, ...restStateProps } = stateProps;
  return {
    ...ownProps,
    ...restStateProps,
    showAddToAddressBookModal: () =>
      dispatchProps.showAddToAddressBookModal(to),
    showQrScanner: () => dispatchProps.showQrScanner(),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(SendContent);
