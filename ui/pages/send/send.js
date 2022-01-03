import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import {
  getIsUsingMyAccountForRecipientSearch,
  getRecipient,
  getRecipientUserInput,
  getSendStage,
  initializeSendState,
  resetRecipientInput,
  resetSendState,
  SEND_STAGES,
  updateRecipient,
  updateRecipientUserInput,
  updateSendAmount,
  getSendTo,
  getState,
  signTransaction,
} from '../../ducks/send';
// import { addHexPrefix } from '../../../../app/scripts/lib/util';
import { addHexPrefix } from '../../../app/scripts/lib/util';
import { getCurrentChainId, isCustomPriceExcessive } from '../../selectors';
import {
  getSendHexDataFeatureFlagState,
  getSendToAccounts,
} from '../../ducks/metamask/metamask';
import { showQrScanner, addToAddressBook } from '../../store/actions';
import { useMetricEvent } from '../../hooks/useMetricEvent';
import {
  isBurnAddress,
  isValidHexAddress,
} from '../../../shared/modules/hexstring-utils';
import { useI18nContext } from '../../hooks/useI18nContext';
import SendHeader from './send-header';
import AddRecipient from './send-content/add-recipient';
import SendContent from './send-content';
import SendFooter from './send-footer';
import EnsInput from './send-content/add-recipient/ens-input';

const sendSliceIsCustomPriceExcessive = (state) =>
  isCustomPriceExcessive(state, true);

export default function SendTransactionScreen() {
  const t = useI18nContext();
  const history = useHistory();
  const chainId = useSelector(getCurrentChainId);
  const stage = useSelector(getSendStage);
  const state = useSelector(getState);
  const gasIsExcessive = useSelector(sendSliceIsCustomPriceExcessive);
  const isUsingMyAccountsForRecipientSearch = useSelector(
    getIsUsingMyAccountForRecipientSearch,
  );
  const recipient = useSelector(getRecipient);
  const showHexData = useSelector(getSendHexDataFeatureFlagState);
  const userInput = useSelector(getRecipientUserInput);
  const location = useLocation();
  const trackUsedQRScanner = useMetricEvent({
    eventOpts: {
      category: 'Transactions',
      action: 'Edit Screen',
      name: 'Used QR scanner',
    },
  });

  const dispatch = useDispatch();
  useEffect(() => {
    if (chainId !== undefined) {
      dispatch(initializeSendState());
    }
  }, [chainId, dispatch]);

  const handleUpdateSendAmount = (number) => {
    dispatch(updateSendAmount(number));
  };

  const handleUpdateSendAddress = (address) => {
    console.log(address, 'addressaddress');
    dispatch(updateRecipientUserInput(address));
    if (
      !isBurnAddress(address) &&
      isValidHexAddress(address, { mixedCaseUseChecksum: true })
    ) {
    }
    dispatch(updateRecipient({ address, nickname: '' }));
    // dispatch(signTransaction());
  };
  const addressIsNew = (toAccounts, newAddress) => {
    const newAddressNormalized = newAddress.toLowerCase();
    const foundMatching = toAccounts.some(
      ({ address }) => address.toLowerCase() === newAddressNormalized,
    );
    return !foundMatching;
  };

  const addToAddressBookIfNew = (nickname = '') => {
    const newAddress = getSendTo(state);
    const toAccounts = getSendToAccounts(state);
    const hexPrefixedAddress = addHexPrefix(newAddress);

    console.log('newAddress', newAddress);
    console.log('toAccounts', toAccounts);
    console.log('hexPrefixedAddress', hexPrefixedAddress);
    if (addressIsNew(toAccounts, hexPrefixedAddress)) {
      // TODO: nickname, i.e. addToAddressBook(recipient, nickname)
      dispatch(addToAddressBook(hexPrefixedAddress, nickname));
    }
  };

  useEffect(() => {
    if (location.search === '?scan=true') {
      dispatch(showQrScanner());

      // Clear the queryString param after showing the modal
      const cleanUrl = window.location.href.split('?')[0];
      window.history.pushState({}, null, `${cleanUrl}`);
      window.location.hash = '#send';
    }
  }, [location, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetSendState());
    };
  }, [dispatch]);

  // let content;
  console.log('state.metamask', state.metamask);
  // if ([SEND_STAGES.EDIT, SEND_STAGES.DRAFT].includes(stage)) {
  const content = (
    <>
      <SendContent
        selectedAddress={state.metamask.selectedAddress}
        recipientAddress={recipient.address}
        history={history}
        showHexData={showHexData}
        gasIsExcessive={gasIsExcessive}
        handleUpdateSendAmount={handleUpdateSendAmount}
        handleUpdateSendAddress={handleUpdateSendAddress}
        signTransaction={() => dispatch(signTransaction())}
        addToAddressBookIfNew={addToAddressBookIfNew}
      />
      {/* <SendFooter key="send-footer" history={history} /> */}
    </>
  );
  // } else {
  //   content = <AddRecipient />;
  // }

  return (
    <div className="page-container send-transaction">
      <div className="page-container-header">
        <img
          onClick={() => history.go(-1)}
          className="return"
          src="./images/return.png"
        />
        <div className="content">{t('send')}</div>
      </div>
      {/* <SendHeader history={history} />
      <EnsInput
        userInput={userInput}
        className="send__to-row"
        onChange={(address) => dispatch(updateRecipientUserInput(address))}
        onValidAddressTyped={(address) =>
          dispatch(updateRecipient({ address, nickname: '' }))
        }
        internalSearch={isUsingMyAccountsForRecipientSearch}
        selectedAddress={recipient.address}
        selectedName={recipient.nickname}
        onPaste={(text) => updateRecipient({ address: text, nickname: '' })}
        onReset={() => dispatch(resetRecipientInput())}
        scanQrCode={() => {
          trackUsedQRScanner();
          dispatch(showQrScanner());
        }}
      /> */}
      {content}
    </div>
  );
}
