import { connect } from 'react-redux';

import {
  setPendingTokens,
  clearPendingTokens,
  showLoadingIndication,
  hideLoadingIndication,
  addNFTToken,
} from '../../store/actions';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
import {
  getIsMainnet,
  getRpcPrefsForCurrentProvider,
} from '../../selectors/selectors';
import AddToken from './add-token.component';
const mapStateToProps = (state) => {
  console.log(state, 'statestatestatestatestate');
  const {
    metamask: {
      identities,
      tokens,
      pendingTokens,
      provider: { chainId },
    },
  } = state;
  return {
    metamask: state.metamask,
    identities,
    mostRecentOverviewPage: getMostRecentOverviewPage(state),
    tokens,
    pendingTokens,
    showSearchTab: getIsMainnet(state) || process.env.IN_TEST === 'true',
    chainId,
    rpcPrefs: getRpcPrefsForCurrentProvider(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addNFTToken: (data) => dispatch(addNFTToken(data)),
    showLoadingIndication: (messages) =>
      dispatch(showLoadingIndication(messages)),
    hideLoadingIndication: () => dispatch(hideLoadingIndication()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddToken);
