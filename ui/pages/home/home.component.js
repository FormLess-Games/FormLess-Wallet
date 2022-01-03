/* eslint-disable no-negated-condition */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { formatDate } from '../../helpers/utils/util';
import AssetList from '../../components/app/asset-list';
import HomeNotification from '../../components/app/home-notification';
import MultipleNotifications from '../../components/app/multiple-notifications';
import TransactionList from '../../components/app/transaction-list';
import TransactionNFTList from '../../components/app/transaction-nft-list';
import Popover from '../../components/ui/popover';
import Button from '../../components/ui/button';
import ConnectedSites from '../connected-sites';
import ConnectedAccounts from '../connected-accounts';
import { Tabs, Tab } from '../../components/ui/tabs';
// import { EthOverview } from '../../components/app/wallet-overview';
// import WhatsNewPopup from '../../components/app/whats-new-popup';
import RecoveryPhraseReminder from '../../components/app/recovery-phrase-reminder';
import {
  ADD_TOKEN_ROUTE,
  ADD_NFT_TOKEN_ROUTE,
  ASSET_ROUTE,
  ASSET_NFT_ROUTE,
  RESTORE_VAULT_ROUTE,
  CONFIRM_TRANSACTION_ROUTE,
  CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE,
  INITIALIZE_BACKUP_SEED_PHRASE_ROUTE,
  CONNECT_ROUTE,
  CONNECTED_ROUTE,
  CONNECTED_ACCOUNTS_ROUTE,
  AWAITING_SWAP_ROUTE,
  BUILD_QUOTE_ROUTE,
  VIEW_QUOTE_ROUTE,
  CONFIRMATION_V_NEXT_ROUTE,
} from '../../helpers/constants/routes';
import nftAbi from '../../nftAbi.json';

import { INDEX_SORT } from '../../../shared/constants/app';

const LEARN_MORE_URL =
  'https://metamask.zendesk.com/hc/en-us/articles/360045129011-Intro-to-MetaMask-v8-extension';
const LEGACY_WEB3_URL =
  'https://metamask.zendesk.com/hc/en-us/articles/360053147012';
const INFURA_BLOCKAGE_URL =
  'https://metamask.zendesk.com/hc/en-us/articles/360059386712';

export default class Home extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object,
    forgottenPassword: PropTypes.bool,
    suggestedTokens: PropTypes.object,
    unconfirmedTransactionsCount: PropTypes.number,
    shouldShowSeedPhraseReminder: PropTypes.bool.isRequired,
    isPopup: PropTypes.bool,
    isNotification: PropTypes.bool.isRequired,
    threeBoxSynced: PropTypes.bool,
    setupThreeBox: PropTypes.func,
    turnThreeBoxSyncingOn: PropTypes.func,
    showRestorePrompt: PropTypes.bool,
    selectedAddress: PropTypes.string,
    restoreFromThreeBox: PropTypes.func,
    setShowRestorePromptToFalse: PropTypes.func,
    threeBoxLastUpdated: PropTypes.number,
    firstPermissionsRequestId: PropTypes.string,
    totalUnapprovedCount: PropTypes.number.isRequired,
    setConnectedStatusPopoverHasBeenShown: PropTypes.func,
    connectedStatusPopoverHasBeenShown: PropTypes.bool,
    defaultHomeActiveTabName: PropTypes.string,
    onTabClick: PropTypes.func.isRequired,
    haveSwapsQuotes: PropTypes.bool.isRequired,
    showAwaitingSwapScreen: PropTypes.bool.isRequired,
    swapsFetchParams: PropTypes.object,
    shouldShowWeb3ShimUsageNotification: PropTypes.bool.isRequired,
    setWeb3ShimUsageAlertDismissed: PropTypes.func.isRequired,
    originOfCurrentTab: PropTypes.string,
    disableWeb3ShimUsageAlert: PropTypes.func.isRequired,
    pendingConfirmations: PropTypes.arrayOf(PropTypes.object).isRequired,
    infuraBlocked: PropTypes.bool.isRequired,
    showWhatsNewPopup: PropTypes.bool.isRequired,
    hideWhatsNewPopup: PropTypes.func.isRequired,
    notificationsToShow: PropTypes.bool.isRequired,
    showRecoveryPhraseReminder: PropTypes.bool.isRequired,
    setRecoveryPhraseReminderHasBeenShown: PropTypes.func.isRequired,
    setRecoveryPhraseReminderLastShown: PropTypes.func.isRequired,
    seedPhraseBackedUp: PropTypes.bool.isRequired,
    tabActive: PropTypes.bool,
    updateIndexSort: PropTypes.func,
    addNFTToken: PropTypes.func,
  };

  state = {
    mounted: false,
    canShowBlockageNotification: true,
    statusDialog: false,
    isActiveList: [],
  };

  componentDidMount() {
    const {
      firstPermissionsRequestId,
      history,
      isNotification,
      suggestedTokens = {},
      totalUnapprovedCount,
      unconfirmedTransactionsCount,
      haveSwapsQuotes,
      showAwaitingSwapScreen,
      swapsFetchParams,
      pendingConfirmations,
    } = this.props;

    this.setState({ mounted: true });
    if (isNotification && totalUnapprovedCount === 0) {
      global.platform.closeCurrentWindow();
    } else if (!isNotification && showAwaitingSwapScreen) {
      history.push(AWAITING_SWAP_ROUTE);
    } else if (!isNotification && haveSwapsQuotes) {
      history.push(VIEW_QUOTE_ROUTE);
    } else if (!isNotification && swapsFetchParams) {
      history.push(BUILD_QUOTE_ROUTE);
    } else if (firstPermissionsRequestId) {
      history.push(`${CONNECT_ROUTE}/${firstPermissionsRequestId}`);
    } else if (unconfirmedTransactionsCount > 0) {
      history.push(CONFIRM_TRANSACTION_ROUTE);
    } else if (Object.keys(suggestedTokens).length > 0) {
      history.push(CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE);
    } else if (pendingConfirmations.length > 0) {
      history.push(CONFIRMATION_V_NEXT_ROUTE);
    }
    this.handleSyncNFT();
    // document.body.onclick = () => {
    //   this.setState({ statusDialog: false });
    // };
  }

  static getDerivedStateFromProps(
    {
      firstPermissionsRequestId,
      isNotification,
      suggestedTokens,
      totalUnapprovedCount,
      unconfirmedTransactionsCount,
      haveSwapsQuotes,
      showAwaitingSwapScreen,
      swapsFetchParams,
    },
    { mounted },
  ) {
    if (!mounted) {
      if (isNotification && totalUnapprovedCount === 0) {
        return { closing: true };
      } else if (
        firstPermissionsRequestId ||
        unconfirmedTransactionsCount > 0 ||
        Object.keys(suggestedTokens).length > 0 ||
        (!isNotification &&
          (showAwaitingSwapScreen || haveSwapsQuotes || swapsFetchParams))
      ) {
        return { redirecting: true };
      }
    }
    return null;
  }

  componentDidUpdate(_, prevState) {
    const {
      setupThreeBox,
      showRestorePrompt,
      threeBoxLastUpdated,
      threeBoxSynced,
    } = this.props;

    if (!prevState.closing && this.state.closing) {
      global.platform.closeCurrentWindow();
    }

    if (threeBoxSynced && showRestorePrompt && threeBoxLastUpdated === null) {
      setupThreeBox();
    }
  }

  handleSyncNFT = () => {
    const {
      provider,
      accountNFTTokens,
      selectedAddress,
      addNFTToken,
    } = this.props;
    fetch(
      `https://g17rzthc7b.execute-api.us-east-2.amazonaws.com/wallets?chainId=${provider.chainId}&user=${selectedAddress}`,
    )
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        const list = res.filter(
          (item) =>
            !accountNFTTokens?.[selectedAddress]?.[provider.chainId].find(
              (nft) =>
                `${nft.contractAddress}${nft.tokenId}` ===
                `${item.token}${item.tokenId}`,
            ),
        );
        list.forEach(async (item) => {
          const token = global.eth.contract(nftAbi).at(item.token);
          const is1155 = await token.supportsInterface('0xd9b67a26');
          const is721 = await token.supportsInterface('0x80ac58cd');
          if (is1155[0]) {
            token.balanceOf(selectedAddress, item.tokenId, (err, number) => {
              if (err || !number[0].toNumber()) {
                return false;
              }
              const data = {
                contractAddress: item.token,
                tokenId: item.tokenId,
                states: '1155',
                selectedAddress,
                number: number.toNumber(),
                name: item.name,
                originalImage: item.uri,
              };
              addNFTToken(data);
            });
          } else if (is721[0]) {
            token.ownerOf(item.tokenId, (err, owner) => {
              if (
                err ||
                !owner[0] ||
                selectedAddress.toLocaleLowerCase() !== owner[0]
              ) {
                return false;
              }
              const data = {
                contractAddress: item.token,
                tokenId: item.tokenId,
                states: '721',
                selectedAddress,
                number: 1,
                name: item.name,
                originalImage: item.uri,
              };
              addNFTToken(data);
            });
          }
        });
      });
  };

  onRecoveryPhraseReminderClose = () => {
    const {
      setRecoveryPhraseReminderHasBeenShown,
      setRecoveryPhraseReminderLastShown,
    } = this.props;
    setRecoveryPhraseReminderHasBeenShown(true);
    setRecoveryPhraseReminderLastShown(new Date().getTime());
  };

  handleSetisActiveList(item) {
    const { isActiveList } = this.state;
    const key = `${item.contractAddress}${item.tokenId}`;
    const index = isActiveList.findIndex((items) => key === items);
    if (index === -1) {
      isActiveList.push(key);
    } else {
      isActiveList.splice(index, 1);
    }
    this.setState({ isActiveList: [...isActiveList] });
  }

  renderNotifications() {
    const { t } = this.context;
    const {
      history,
      shouldShowSeedPhraseReminder,
      isPopup,
      selectedAddress,
      restoreFromThreeBox,
      turnThreeBoxSyncingOn,
      setShowRestorePromptToFalse,
      showRestorePrompt,
      threeBoxLastUpdated,
      shouldShowWeb3ShimUsageNotification,
      setWeb3ShimUsageAlertDismissed,
      originOfCurrentTab,
      disableWeb3ShimUsageAlert,
      infuraBlocked,
    } = this.props;

    return (
      <MultipleNotifications>
        {shouldShowWeb3ShimUsageNotification ? (
          <HomeNotification
            descriptionText={t('web3ShimUsageNotification', [
              <span
                key="web3ShimUsageNotificationLink"
                className="home-notification__text-link"
                onClick={() =>
                  global.platform.openTab({ url: LEGACY_WEB3_URL })
                }
              >
                {t('here')}
              </span>,
            ])}
            ignoreText={t('dismiss')}
            onIgnore={(disable) => {
              setWeb3ShimUsageAlertDismissed(originOfCurrentTab);
              if (disable) {
                disableWeb3ShimUsageAlert();
              }
            }}
            checkboxText={t('dontShowThisAgain')}
            checkboxTooltipText={t('canToggleInSettings')}
            key="home-web3ShimUsageNotification"
          />
        ) : null}
        {shouldShowSeedPhraseReminder ? (
          <HomeNotification
            descriptionText={t('backupApprovalNotice')}
            acceptText={t('backupNow')}
            onAccept={() => {
              if (isPopup) {
                global.platform.openExtensionInBrowser(
                  INITIALIZE_BACKUP_SEED_PHRASE_ROUTE,
                );
              } else {
                history.push(INITIALIZE_BACKUP_SEED_PHRASE_ROUTE);
              }
            }}
            infoText={t('backupApprovalInfo')}
            key="home-backupApprovalNotice"
          />
        ) : null}
        {threeBoxLastUpdated && showRestorePrompt ? (
          <HomeNotification
            descriptionText={t('restoreWalletPreferences', [
              formatDate(threeBoxLastUpdated, 'M/d/y'),
            ])}
            acceptText={t('restore')}
            ignoreText={t('noThanks')}
            infoText={t('dataBackupFoundInfo')}
            onAccept={() => {
              restoreFromThreeBox(selectedAddress).then(() => {
                turnThreeBoxSyncingOn();
              });
            }}
            onIgnore={() => {
              setShowRestorePromptToFalse();
            }}
            key="home-privacyModeDefault"
          />
        ) : null}
        {infuraBlocked && this.state.canShowBlockageNotification ? (
          <HomeNotification
            descriptionText={t('infuraBlockedNotification', [
              <span
                key="infuraBlockedNotificationLink"
                className="home-notification__text-link"
                onClick={() =>
                  global.platform.openTab({ url: INFURA_BLOCKAGE_URL })
                }
              >
                {t('here')}
              </span>,
            ])}
            ignoreText={t('dismiss')}
            onIgnore={() => {
              this.setState({
                canShowBlockageNotification: false,
              });
            }}
            key="home-infuraBlockedNotification"
          />
        ) : null}
      </MultipleNotifications>
    );
  }

  renderPopover = () => {
    const { setConnectedStatusPopoverHasBeenShown } = this.props;
    const { t } = this.context;
    return (
      <Popover
        title={t('whatsThis')}
        onClose={setConnectedStatusPopoverHasBeenShown}
        className="home__connected-status-popover"
        showArrow
        CustomBackground={({ onClose }) => {
          return (
            <div
              className="home__connected-status-popover-bg-container"
              onClick={onClose}
            >
              <div className="home__connected-status-popover-bg" />
            </div>
          );
        }}
        footer={
          <>
            <a href={LEARN_MORE_URL} target="_blank" rel="noopener noreferrer">
              {t('learnMore')}
            </a>
            <Button
              type="primary"
              onClick={setConnectedStatusPopoverHasBeenShown}
            >
              {t('dismiss')}
            </Button>
          </>
        }
      >
        <main className="home__connect-status-text">
          <div>{t('metaMaskConnectStatusParagraphOne')}</div>
          <div>{t('metaMaskConnectStatusParagraphTwo')}</div>
          <div>{t('metaMaskConnectStatusParagraphThree')}</div>
        </main>
      </Popover>
    );
  };

  onContainer = () => {
    this.setState({ statusDialog: false });
  };

  render() {
    const { t } = this.context;
    const {
      defaultHomeActiveTabName,
      onTabClick,
      forgottenPassword,
      history,
      connectedStatusPopoverHasBeenShown,
      isPopup,
      notificationsToShow,
      showWhatsNewPopup,
      hideWhatsNewPopup,
      seedPhraseBackedUp,
      showRecoveryPhraseReminder,
      tabActive,
      provider,
      accountNFTTokens,
      selectedAddress,
    } = this.props;
    console.log(
      defaultHomeActiveTabName,
      this,
      'defaultHomeActiveTabNamedefaultHomeActiveTabName',
    );
    const { statusDialog, isActiveList } = this.state;

    if (forgottenPassword) {
      return <Redirect to={{ pathname: RESTORE_VAULT_ROUTE }} />;
    } else if (this.state.closing || this.state.redirecting) {
      return null;
    }

    const showWhatsNew = notificationsToShow && showWhatsNewPopup;

    return (
      <div className="main-container" onClick={this.onContainer.bind(this)}>
        <Route path={CONNECTED_ROUTE} component={ConnectedSites} exact />
        <Route
          path={CONNECTED_ACCOUNTS_ROUTE}
          component={ConnectedAccounts}
          exact
        />
        <div className="home__container">
          {/* {showWhatsNew ? <WhatsNewPopup onClose={hideWhatsNewPopup} /> : null} */}
          {!showWhatsNew && showRecoveryPhraseReminder ? (
            <RecoveryPhraseReminder
              hasBackedUp={seedPhraseBackedUp}
              onConfirm={this.onRecoveryPhraseReminderClose}
            />
          ) : null}
          {isPopup && !connectedStatusPopoverHasBeenShown
            ? this.renderPopover()
            : null}
          <div className="home__main-view">
            {/* <MenuBar /> */}
            {/* <div className="home__balance-wrapper">
              <EthOverview />
            </div> */}
            {!tabActive ? (
              <>
                <img
                  onClick={(e) => {
                    e.stopPropagation();
                    this.setState({ statusDialog: true });
                  }}
                  className="sort"
                  src="./images/sort.png"
                />
                <img
                  onClick={() => history.push(ADD_TOKEN_ROUTE)}
                  className="add"
                  src="./images/add.png"
                />
              </>
            ) : (
              <img
                onClick={() => history.push(ADD_NFT_TOKEN_ROUTE)}
                className="add"
                src="./images/add.png"
              />
            )}
            {!tabActive ? (
              <Tabs
                defaultActiveTabName={defaultHomeActiveTabName}
                // defaultActiveTabName={t('numberAsset')}
                onTabClick={onTabClick}
                tabsClassName="home__tabs an"
              >
                <Tab
                  activeClassName="home__tab--active"
                  className="home__tab"
                  data-testid="home__asset-tab"
                  name={t('numberAsset')}
                >
                  <AssetList
                    onClickAsset={(asset) =>
                      history.push(`${ASSET_ROUTE}/${asset}`)
                    }
                  />
                </Tab>
                <Tab
                  activeClassName="home__tab--active"
                  className="home__tab"
                  data-testid="home__activity-tab"
                  name={t('transRecord')}
                >
                  <TransactionList />
                </Tab>
              </Tabs>
            ) : (
              <Tabs
                defaultActiveTabName={t('nftAsset')}
                onTabClick={onTabClick}
                tabsClassName="home__tabs"
              >
                <Tab
                  activeClassName="home__tab--active"
                  className="home__tab"
                  data-testid="home__asset-tab"
                  name={t('nftAsset')}
                >
                  {accountNFTTokens[selectedAddress]?.[provider.chainId]
                    ?.length ? (
                    <div className="rs-nft-list">
                      {accountNFTTokens[selectedAddress]?.[
                        provider.chainId
                      ].map((item, index) => (
                        <div key={index} className="rs-nft-li">
                          <div
                            className="rs-nft-header"
                            onClick={() => {
                              history.push(
                                `${ASSET_NFT_ROUTE}/${item.contractAddress}?tokenId=${item.tokenId}&states=${item.states}`,
                              );
                            }}
                          >
                            <div className="name">{item.name}</div>
                            <div className="ri">
                              <div className="colled">{item.number}</div>
                              <img
                                className="collection"
                                src="./images/collection-icon.png"
                              />
                              <img
                                className={`${
                                  !isActiveList.find(
                                    (key) =>
                                      key ===
                                      `${item.contractAddress}${item.tokenId}`,
                                  )
                                    ? 'an'
                                    : ''
                                } up`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.handleSetisActiveList(item);
                                }}
                                src="./images/up.png"
                              />
                            </div>
                          </div>
                          {!isActiveList.find(
                            (key) =>
                              key === `${item.contractAddress}${item.tokenId}`,
                          ) && (
                            <>
                              <div className="img-cont">
                                <div className="img-position">
                                  {item.animation_url ? (
                                    <video
                                      controls
                                      preload="auto"
                                      width="325"
                                      height="325"
                                      poster={item.originalImage}
                                      data-setup={{}}
                                    >
                                      <source
                                        src={item.animation_url}
                                        type="video/mp4"
                                      />
                                    </video>
                                  ) : (
                                    // <img src={item.originalImage} />
                                    <img
                                      onClick={() => {
                                        history.push(
                                          `${ASSET_NFT_ROUTE}/${item.contractAddress}?tokenId=${item.tokenId}&states=${item.states}`,
                                        );
                                      }}
                                      src={item.originalImage}
                                    />
                                  )}
                                </div>
                              </div>
                              <div className="nft-address">
                                {t('contractAddress')}：{item.contractAddress}
                              </div>
                              <div className="nft-tokenId">
                                tokenId：{item.tokenId}
                              </div>
                              {item.states === '1155' && (
                                <div className="nft-tokenId">
                                  {t('units')}：{item.number}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rs-no-data">{t('noTransactions')}</div>
                  )}
                </Tab>
                <Tab
                  activeClassName="home__tab--active"
                  className="home__tab"
                  data-testid="home__activity-tab"
                  name={t('transRecord')}
                >
                  <TransactionNFTList isNFT hideTokenTransactions />
                </Tab>
              </Tabs>
            )}

            {statusDialog && (
              <div className="home__tab-switch-states">
                <div className="home__tab-switch-states-list">
                  <div
                    onClick={(e) => {
                      e.nativeEvent.stopImmediatePropagation();
                      console.log('INDEX_SORT.NET_VALUE', INDEX_SORT.NET_VALUE);
                      this.props.updateIndexSort(INDEX_SORT.NET_VALUE);
                      this.setState({ statusDialog: false });
                    }}
                    className="home__tab-switch-states-li"
                  >
                    {t('sortValue')}
                  </div>
                  <div
                    onClick={(e) => {
                      e.nativeEvent.stopImmediatePropagation();
                      this.props.updateIndexSort(INDEX_SORT.NAME);
                      this.setState({ statusDialog: false });
                    }}
                    className="home__tab-switch-states-li"
                  >
                    {t('sortName')}
                  </div>
                </div>
              </div>
            )}
            {/* <div className="home__support">
              {t('needHelp', [
                <a
                  href="https://support.metamask.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  key="need-help-link"
                >
                  {t('needHelpLinkText')}
                </a>,
              ])}
            </div> */}
          </div>

          {this.renderNotifications()}
        </div>
      </div>
    );
  }
}
