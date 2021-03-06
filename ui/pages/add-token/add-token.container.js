import { connect } from 'react-redux';

import { setPendingTokens, clearPendingTokens } from '../../store/actions';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
import {
  getIsMainnet,
  getIsMatic,
  getRpcPrefsForCurrentProvider,
} from '../../selectors/selectors';
import AddToken from './add-token.component';

const mapStateToProps = (state) => {
  const {
    metamask: {
      identities,
      tokens,
      pendingTokens,
      provider: { chainId },
    },
  } = state;
  return {
    identities,
    mostRecentOverviewPage: getMostRecentOverviewPage(state),
    tokens,
    pendingTokens,
    showSearchTab:
      getIsMainnet(state) ||
      getIsMatic(state) ||
      process.env.IN_TEST === 'true',
    isMatic: getIsMatic(state),
    chainId,
    rpcPrefs: getRpcPrefsForCurrentProvider(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setPendingTokens: (tokens) => dispatch(setPendingTokens(tokens)),
    clearPendingTokens: () => dispatch(clearPendingTokens()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddToken);
