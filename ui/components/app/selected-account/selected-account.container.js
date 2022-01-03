import { connect } from 'react-redux';
import { getSelectedIdentity, getCurrentChainId } from '../../../selectors';
import SelectedAccount from './selected-account.component';

const mapStateToProps = (state) => {
  console.log(state, 'SelectedAccountSelectedAccount');
  const { frequentRpcListDetail, provider } = state.metamask;
  const selectRpcInfo = frequentRpcListDetail.find(
    (rpcInfo) => rpcInfo.rpcUrl === provider.rpcUrl,
  );
  const { rpcPrefs = {} } = selectRpcInfo || {};
  const { chainId } = state.metamask.provider;
  return {
    chainId,
    selectedIdentity: getSelectedIdentity(state),
    rpcPrefs,
  };
};

export default connect(mapStateToProps)(SelectedAccount);
