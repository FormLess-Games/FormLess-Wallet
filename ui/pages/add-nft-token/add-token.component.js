import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NetworkController, {
  NETWORK_EVENTS,
} from '../../../app/scripts/controllers/network';
import migrations from '../../../app/scripts/migrations';
import Migrator from '../../../app/scripts/lib/migrator';
import LocalStore from '../../../app/scripts/lib/local-store';
import ReadOnlyNetworkStore from '../../../app/scripts/lib/network-store';
import Web3 from 'web3';
import { defaultNetworksData } from '../../../ui/pages/settings/networks-tab/networks-tab.constants';
import { ca } from '../../../.storybook/locales';

const localStore = new LocalStore();
let versionedData;
const emptyAddr = '0x0000000000000000000000000000000000000000';

const MIN_DECIMAL_VALUE = 0;
const MAX_DECIMAL_VALUE = 36;

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
let web3 = null;

class AddToken extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object,
    setPendingTokens: PropTypes.func,
    pendingTokens: PropTypes.object,
    clearPendingTokens: PropTypes.func,
    tokens: PropTypes.array,
    identities: PropTypes.object,
    showSearchTab: PropTypes.bool.isRequired,
    mostRecentOverviewPage: PropTypes.string.isRequired,
    chainId: PropTypes.string,
    rpcPrefs: PropTypes.object,
    metamask: PropTypes.object,
  };

  state = {
    customAddress: '',
    customTokenId: '',
    error: '',
    loading: false,
  };

  componentDidMount() {
    console.log(this, 'this,------');
  }

  handleAddNFT(data, contract) {
    const {
      history,
      showLoadingIndication,
      addNFTToken,
      mostRecentOverviewPage,
    } = this.props;

    contract[data.states === '721' ? 'tokenURI' : 'uri'](
      data.tokenId,
      (err, url) => {
        if (err) {
          this.handleThreeError();
          return false;
        }
        showLoadingIndication(this.context.t('awaitData'));
        url = url.replace('ipfs://', 'https://ipfs.io/ipfs/');
        fetch(url)
          .then((response) => {
            return response.json();
          })
          .then((result) => {
            const originalImage = result.originalImage || result.image;
            const animation_url = result.animation_url;
            addNFTToken(
              Object.assign(data, {
                name: result.name,
                originalImage:
                  originalImage.replace('ipfs://', 'https://ipfs.io/ipfs/') ||
                  './images/test.png',
                animation_url: animation_url
                  ? animation_url.replace('ipfs://', 'https://ipfs.io/ipfs/')
                  : '',
              }),
            ).then((res) => {
              // history.push(mostRecentOverviewPage);
              history.go(-1);
            });
          })
          .catch((err) => {
            addNFTToken(
              Object.assign(data, {
                name: 'Formless',
                originalImage: './images/test.png',
              }),
            ).then((res) => {
              history.go(-1);
              // history.push(mostRecentOverviewPage);
            });
          });
        console.log(err, url, 'URL');
      },
    );
  }

  handleThreeError() {
    const { hideLoadingIndication } = this.props;

    this.setState({
      error: this.context.t('addNFTTokenError'),
      loading: false,
    });
    hideLoadingIndication();
  }

  async handleAddNFTToken() {
    const { customAddress, customTokenId, loading } = this.state;
    const { metamask } = this.props;
    const selectedAddress = metamask.selectedAddress;
    console.log(metamask, 'XXXXX');

    if (customAddress && customTokenId !== '' && !loading) {
      this.setState({ loading: true });
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
      try {
        let contract = web3.eth.contract(abi).at(customAddress);
        const is1155 = await contract.supportsInterface('0xd9b67a26');
        const is721 = await contract.supportsInterface('0x80ac58cd');
        if (is1155) {
          contract.balanceOf(selectedAddress, customTokenId, (err, number) => {
            if (err || !number.toNumber()) {
              this.handleThreeError();
              return false;
            }
            this.handleAddNFT(
              {
                contractAddress: customAddress,
                tokenId: customTokenId,
                states: '1155',
                selectedAddress,
                number: number.toNumber(),
              },
              contract,
            );
          });
        } else if (is721) {
          contract.ownerOf(customTokenId, (err, owner) => {
            if (
              err ||
              !owner ||
              selectedAddress.toLocaleLowerCase() !== owner
            ) {
              this.handleThreeError();
              return false;
            }
            this.handleAddNFT(
              {
                contractAddress: customAddress,
                tokenId: customTokenId,
                states: '721',
                selectedAddress,
                number: 1,
              },
              contract,
            );
          });
        } else {
          this.handleThreeError();
        }
      } catch (e) {
        this.handleThreeError();
      }
    }
  }

  handleTokenIdChange(value) {
    const reg = /^[0-9]*$/;
    if (reg.test(value) || value === '') {
      this.setState({ customTokenId: value ? parseInt(value) : '', error: '' });
    }
  }

  render() {
    const { history, clearPendingTokens, mostRecentOverviewPage } = this.props;
    const { customAddress, customTokenId, error, loading } = this.state;

    return (
      <div className="page-container rs-add-token">
        <div className="page-container-header">
          <img
            onClick={() => {
              history.push(mostRecentOverviewPage);
            }}
            className="return"
            src="./images/return.png"
          />
          <div className="content">{this.context.t('add')}NFT</div>
        </div>
        <div className="rs-add-nft-token">
          <div className="new-account-content-addAccount bn">
            <div className="name">NFT{this.context.t('contractAddress')}</div>
            <div className="new-account-content-input">
              <input
                value={customAddress}
                type="text"
                placeholder={this.context.t('inputAddress')}
                onChange={(e) =>
                  this.setState({ customAddress: e.target.value, error: '' })
                }
              />
            </div>
          </div>
          <div className="new-account-content-addAccount bn">
            <div className="name">TokenId</div>
            <div className="new-account-content-input">
              <input
                value={customTokenId}
                type="text"
                placeholder="TokenId"
                onChange={(e) => this.handleTokenIdChange(e.target.value)}
              />
            </div>
          </div>
          <div className="add-nft-token-err">{error}</div>
        </div>
        <div
          onClick={() => this.handleAddNFTToken()}
          className={`${
            loading || customTokenId === '' || !customAddress ? 'an' : ''
          } add-nft-btn`}
        >
          {this.context.t('add')}
        </div>
      </div>
    );
  }
}

export default AddToken;
