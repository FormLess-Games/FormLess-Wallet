import { connect } from 'react-redux';
import { tryReverseResolveAddress } from '../../../store/actions';
import {
  getAddressBook,
  getRpcPrefsForCurrentProvider,
  getShouldShowFiat,
} from '../../../selectors';
import { toChecksumHexAddress } from '../../../../shared/modules/hexstring-utils';
import TransactionListItemDetails from './transaction-list-item-details.component';
import { getNativeCurrency } from '../../../ducks/metamask/metamask';

const mapStateToProps = (state, ownProps) => {
  const { metamask } = state;
  const { ensResolutionsByAddress } = metamask;
  const { recipientAddress, senderAddress } = ownProps;
  let recipientEns;
  if (recipientAddress) {
    const address = toChecksumHexAddress(recipientAddress);
    recipientEns = ensResolutionsByAddress[address] || '';
  }
  const addressBook = getAddressBook(state);

  const getNickName = (address) => {
    const entry = addressBook.find((contact) => {
      return address.toLowerCase() === contact.address.toLowerCase();
    });
    return (entry && entry.name) || '';
  };
  const rpcPrefs = getRpcPrefsForCurrentProvider(state);
  const showFiat = getShouldShowFiat(state);

  return {
    showFiat,
    nativeCurrency: getNativeCurrency(state),
    rpcPrefs,
    recipientEns,
    senderNickname: getNickName(senderAddress),
    recipientNickname: recipientAddress ? getNickName(recipientAddress) : null,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    tryReverseResolveAddress: (address) => {
      return dispatch(tryReverseResolveAddress(address));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TransactionListItemDetails);
