/**
 * @typedef {Object} FirstTimeState
 * @property {Object} config Initial configuration parameters
 * @property {Object} NetworkController Network controller state
 */

/**
 * @type {FirstTimeState}
 */
const initialState = {
  config: {},
  PreferencesController: {
    frequentRpcListDetail: [
      {
        rpcUrl: 'http://localhost:8545',
        chainId: '0x539',
        ticker: 'ETH',
        nickname: 'Localhost 8545',
        rpcPrefs: {},
      },
      {
        rpcUrl: 'https://polygon-mainnet.infura.io/v3/60e51d66a38e4624bfb90643cff08d0b',
        chainId: '0x89',
        ticker: 'MATIC',
        nickname: 'Polygon PoS (Matic) ',
        rpcPrefs: {
          blockExplorerUrl: 'https://polygonscan.com',
        },
      },
    ],
  },
};

export default initialState;
