import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Web3 from 'web3';
import { getTokenTrackerLink } from '@metamask/etherscan-link';

import TransactionNFTList from '../../components/app/transaction-nft-list';
import {
  getSelectedIdentity,
  getCurrentChainId,
  getRpcPrefsForCurrentProvider,
  getSelectedAddress,
} from '../../selectors/selectors';
import { DEFAULT_ROUTE, SEND_NFT_ROUTE } from '../../helpers/constants/routes';
import {
  ASSET_TYPES,
  updateSendAsset,
  updateNFTSendAsset,
} from '../../ducks/send';
import { defaultNetworksData } from '../settings/networks-tab/networks-tab.constants';
import { addNFTToken } from '../../store/actions';
import { useI18nContext } from '../../hooks/useI18nContext';
import AssetNavigation from './asset-navigation';
import AssetOptions from './asset-options';
import { showModal } from '../../store/actions';

const abi = [
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'uri',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export default function NativeAsset({ metamask }) {
  const t = useI18nContext();
  const [isSend, setIsSend] = useState(false);
  const chainId = useSelector(getCurrentChainId);
  const rpcPrefs = useSelector(getRpcPrefsForCurrentProvider);
  const address = useSelector(getSelectedAddress);
  const selectedAccountName = useSelector(
    (state) => getSelectedIdentity(state).name,
  );
  const history = useHistory();

  const handleUrlArgs = (search) => {
    const args = {};
    const query = search.substring(1);
    const pairs = query.split('&');
    for (let i = 0; i < pairs.length; i++) {
      const pos = pairs[i].indexOf('=');
      if (pos == -1) {
        continue;
      }
      const name = pairs[i].substring(0, pos);
      console.log(name);
      const value = pairs[i].substring(pos + 1);
      args[name] = value;
    }
    return args;
  };

  const states = useMemo(() => {
    if (history.location.search) {
      return handleUrlArgs(history.location.search).states;
    }
    return '';
  }, [history.location.search]);

  const contractAddress = useMemo(() => {
    console.log(history.location, 'location.pathnamelocation.pathname');
    if (history.location.pathname) {
      return history.location.pathname.replace('/asset-nft/', '');
    }
    return '';
  }, [history.location.pathname]);

  const tokenId = useMemo(() => {
    console.log(history.location.search, 'location.search.search');

    if (history.location.search) {
      return handleUrlArgs(history.location.search).tokenId;
    }
    return '';
  }, [history.location.search]);

  console.log(metamask, 'metamaskmetamask');
  const dispatch = useDispatch();

  const key = `${contractAddress}${tokenId}`;
  const nftInfo = useMemo(() => {
    const info = metamask.accountNFTTokens?.[address]?.[chainId].find(
      (item) => `${item.contractAddress}${item.tokenId}` === key,
    );
    return info || {};
  }, [metamask.accountNFTTokens, address, chainId]);

  useEffect(() => {
    if (states && contractAddress && tokenId) {
      let web3;
      try {
        if (metamask.provider.rpcUrl) {
          web3 = new Web3(
            new Web3.providers.HttpProvider(metamask.provider.rpcUrl),
          );
        } else {
          console.log(
            defaultNetworksData,
            'defaultNetworksDatadefaultNetworksData',
          );
          const rpcInfo = defaultNetworksData.find(
            (item) => item.chainId == metamask.provider.chainId,
          );
          web3 = new Web3(new Web3.providers.HttpProvider(rpcInfo.rpcUrl));
        }
      } catch (e) {
        console.log(e);
        this.setState({ error: 'Network Error', loading: false });
        return false;
      }
      const contract = web3.eth.contract(abi).at(contractAddress);

      if (states === '1155') {
        contract.balanceOf(
          metamask.selectedAddress,
          Number(tokenId),
          (err, number) => {
            if (!err && number.toNumber()) {
              setIsSend(true);
              dispatch(addNFTToken({ ...nftInfo, number: number.toNumber() }));
            }
          },
        );
      } else {
        contract.ownerOf(tokenId, (err, owner) => {
          if (
            !err &&
            owner &&
            metamask.selectedAddress.toLocaleLowerCase() === owner
          ) {
            setIsSend(true);
          }
        });
      }
    }
  }, [contractAddress, tokenId, states]);

  console.log(
    metamask.accountNFTTokens,
    chainId,
    address,
    nftInfo,
    contractAddress,
    tokenId,
    '-----------------------------',
  );

  const tokenTrackerLink = getTokenTrackerLink(
    nftInfo.contractAddress,
    chainId,
    null,
    address,
    rpcPrefs,
  );

  console.log(this, history);
  return (
    <>
      {/* <div className="asset-navigation">
        <button
          className="asset-breadcrumb"
          onClick={() => history.push(DEFAULT_ROUTE)}
        >
          <img className="return" src="./images/return.png" />
          <div className="content">{selectedAccountName} / NFT</div>
        </button>
      </div> */}
      <AssetNavigation
        accountName={selectedAccountName}
        assetName={nftInfo.states === '1155' ? 'ERC1155' : 'ERC721'}
        onBack={() => history.push(DEFAULT_ROUTE)}
        optionsButton={
          <AssetOptions
            onRemove={() =>
              dispatch(showModal({ name: 'HIDE_NFT_CONFIRMATION', nftInfo }))
            }
            isEthNetwork={!rpcPrefs.blockExplorerUrl}
            onClickBlockExplorer={() => {
              global.platform.openTab({ url: tokenTrackerLink });
            }}
            onViewAccountDetails={() => {
              dispatch(showModal({ name: 'ACCOUNT_DETAILS' }));
            }}
            tokenSymbol={nftInfo?.name}
          />
        }
      />
      <div className="asset-nft-info">
        <div className="asset-nft-info-img">
          {nftInfo.animation_url ? (
            <video
              controls
              preload="auto"
              width="225"
              height="225"
              poster={nftInfo.originalImage}
              data-setup={{}}
            >
              <source src={nftInfo.animation_url} />
            </video>
          ) : nftInfo.originalImage ? (
            <img src={nftInfo.originalImage} />
          ) : (
            ''
          )}
        </div>
        <div className="name">{nftInfo?.name}</div>
        <div className="contract-address an">
          <span>{t('contractAddress')}：</span>
          <div>{contractAddress}</div>
        </div>
        <div className="contract-address">TokenId：{tokenId}</div>
        {nftInfo?.states === '1155' && (
          <div className="contract-address">
            {t('units')}：{nftInfo.number}
          </div>
        )}
        <div className="contract-address">
          {t('nativeNetworks')}：{metamask.nativeCurrency}
        </div>
      </div>
      <div className="eth-overview-btn-list">
        <div
          className={isSend ? '' : 'an'}
          onClick={() => {
            if (isSend) {
              history.push(
                `${SEND_NFT_ROUTE}?contractAddress=${contractAddress}&tokenId=${tokenId}`,
              );
            }
          }}
        >
          {t('send')}
        </div>
        <div onClick={() => window.open('https://opensea.io')}>
          {t('goTrans')}
        </div>
      </div>
      <TransactionNFTList
        useContractAddress={contractAddress}
        useTokenId={tokenId}
        isNFT
        header
        hideTokenTransactions
      />
    </>
  );
}

NativeAsset.propTypes = {
  nativeCurrency: PropTypes.string.isRequired,
};
