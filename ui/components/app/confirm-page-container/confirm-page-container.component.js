import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SenderToRecipient from '../../ui/sender-to-recipient';
import { PageContainerFooter } from '../../ui/page-container';
import {
  ConfirmPageContainerHeader,
  ConfirmPageContainerContent,
  ConfirmPageContainerNavigation,
} from '.';
import UserPreferencedCurrencyDisplay from '../user-preferenced-currency-display';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import { shortenAddress } from '../../../helpers/utils/util';

export default class ConfirmPageContainer extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    // Header
    action: PropTypes.string,
    hideSubtitle: PropTypes.bool,
    onEdit: PropTypes.func,
    showEdit: PropTypes.bool,
    subtitleComponent: PropTypes.node,
    title: PropTypes.string,
    titleComponent: PropTypes.node,
    hideSenderToRecipient: PropTypes.bool,
    showAccountInHeader: PropTypes.bool,
    // Sender to Recipient
    fromAddress: PropTypes.string,
    fromName: PropTypes.string,
    toAddress: PropTypes.string,
    toName: PropTypes.string,
    toEns: PropTypes.string,
    toNickname: PropTypes.string,
    // Content
    contentComponent: PropTypes.node,
    errorKey: PropTypes.string,
    errorMessage: PropTypes.string,
    dataComponent: PropTypes.node,
    detailsComponent: PropTypes.node,
    identiconAddress: PropTypes.string,
    nonce: PropTypes.string,
    assetImage: PropTypes.string,
    warning: PropTypes.string,
    unapprovedTxCount: PropTypes.number,
    origin: PropTypes.string.isRequired,
    ethGasPriceWarning: PropTypes.string,
    // Navigation
    totalTx: PropTypes.number,
    positionOfCurrentTx: PropTypes.number,
    nextTxId: PropTypes.string,
    prevTxId: PropTypes.string,
    showNavigation: PropTypes.bool,
    onNextTx: PropTypes.func,
    firstTx: PropTypes.string,
    lastTx: PropTypes.string,
    ofText: PropTypes.string,
    requestsWaitingText: PropTypes.string,
    // Footer
    onCancelAll: PropTypes.func,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
    disabled: PropTypes.bool,
    customGas: PropTypes.object,
    hexTransactionFee: PropTypes.string,
    label: PropTypes.string,
    history: PropTypes.object,
    tokenData: PropTypes.object,
    chainId: PropTypes.string,
    nativeCurrency: PropTypes.string,
    accountNFTTokens: PropTypes.object,
    data: PropTypes.string,
    hexTransactionAmount: PropTypes.string,
    showFiat: PropTypes.bool,
  };

  render() {
    const {
      showEdit,
      onEdit,
      fromName,
      fromAddress,
      toName,
      toEns,
      toNickname,
      toAddress,
      disabled,
      errorKey,
      errorMessage,
      contentComponent,
      action,
      title,
      titleComponent,
      subtitleComponent,
      hideSubtitle,
      detailsComponent,
      dataComponent,
      onCancelAll,
      onCancel,
      onSubmit,
      identiconAddress,
      nonce,
      unapprovedTxCount,
      assetImage,
      warning,
      totalTx,
      positionOfCurrentTx,
      nextTxId,
      prevTxId,
      showNavigation,
      onNextTx,
      firstTx,
      lastTx,
      ofText,
      requestsWaitingText,
      hideSenderToRecipient,
      showAccountInHeader,
      origin,
      ethGasPriceWarning,
      customGas,
      hexTransactionFee,
      label,
      tokenData,
      chainId,
      accountNFTTokens,
      nativeCurrency,
      data,
      hexTransactionAmount,
      showFiat,
    } = this.props;
    const renderAssetImage = contentComponent || !identiconAddress;
    console.log(
      totalTx,
      positionOfCurrentTx,
      nextTxId,
      prevTxId,
      showNavigation,
      firstTx,
      lastTx,
      ofText,
      requestsWaitingText,
      '--------------+++++ ++++++++++',
      this,
    );
    console.log(
      fromName,
      fromAddress,
      toName,
      toAddress,
      toEns,
      toNickname,
      renderAssetImage,
      assetImage,
      '9************************',
    );

    const nftList = accountNFTTokens?.[fromAddress]?.[chainId];
    const nftInfo = nftList?.find((item) => {
      const tokenId = parseInt(`0x${data?.substr(138)}`, 16);
      const tokenId2 = parseInt(`0x${data?.substr(138, 64)}`, 16);
      return (
        `${item.contractAddress}${item.tokenId}` === `${toAddress}${tokenId}` ||
        `${item.contractAddress}${item.tokenId}` === `${toAddress}${tokenId2}`
      );
    });

    let nftNumber = 1;
    let nftToAddress = '';
    if (nftInfo) {
      nftToAddress = shortenAddress(`0x${data?.substr(98, 40)}`);
      if (nftInfo.states === '1155') {
        nftNumber = parseInt(`0x${data?.substr(202, 64)}`, 16);
      }
    }

    console.log(nftInfo);
    return (
      <div className="page-container">
        <div className="page-container-header">
          <img
            onClick={() => onCancel()}
            className="return"
            src="./images/return.png"
          />
          <div className="content">{this.context.t('transConfirm')}</div>
        </div>
        <div className="page-container-network">
          <span></span>
          <em>{label}</em>
        </div>
        {nftInfo ? (
          <div className="page-container-send-nft">
            <div className="img-cont">
              <img src={nftInfo?.originalImage} />
            </div>
            <div className="name">{nftInfo?.name}</div>
          </div>
        ) : (
          <div className="page-container-send-price">
            <img src="./images/ETH.png" />
            {title ? (
              <div className="eth-amount">{title}</div>
            ) : (
              <div className="eth-amount">
                {titleComponent}&nbsp;{nativeCurrency}
              </div>
            )}
            <div className="zh-eth">
              {showFiat && (
                <UserPreferencedCurrencyDisplay
                  className="confirm-detail-row__secondary"
                  type={SECONDARY}
                  value={hexTransactionAmount}
                  hideLabel
                  isCustom
                />
              )}
            </div>
          </div>
        )}

        <div className="page-container-send-list">
          <div className="page-container-send-li">
            <div className="name">{this.context.t('type')}</div>
            <div className="code">
              {nftInfo ? this.context.t('transfer') : action}
            </div>
          </div>
          <div className="page-container-send-li">
            <div className="name">{this.context.t('from')}</div>
            <div className="code">{shortenAddress(fromAddress)}</div>
          </div>
          <div className="page-container-send-li">
            <div className="name">{this.context.t('to')}</div>
            <div className="code">
              {nftInfo ? nftToAddress : shortenAddress(toAddress)}
            </div>
          </div>
          {nftInfo ? (
            <div className="page-container-send-li">
              <div className="name">{this.context.t('number')}</div>
              <div className="code">{nftNumber}</div>
            </div>
          ) : (
            <div className="page-container-send-li">
              <div className="name">{this.context.t('number')}</div>
              {title ? (
                <div className="code">{title}</div>
              ) : (
                <div className="code">
                  {titleComponent}&nbsp;{nativeCurrency}
                </div>
              )}
            </div>
          )}
          <div className="page-container-send-li">
            <div className="name">{this.context.t('transactionFee')}</div>
            <div className="code">
              <UserPreferencedCurrencyDisplay
                className="confirm-detail-row__primary"
                value={hexTransactionFee}
                hideLabel
                isCustom
                type={PRIMARY}
              />
              &nbsp;{nativeCurrency}
            </div>
          </div>
        </div>
        <div className="page-container-btn-list">
          <div className="an" onClick={() => onCancel()}>
            {this.context.t('reject')}
          </div>
          <div onClick={() => onSubmit()}>{this.context.t('confirm')}</div>
        </div>
        {/* <ConfirmPageContainerNavigation
          totalTx={totalTx}
          positionOfCurrentTx={positionOfCurrentTx}
          nextTxId={nextTxId}
          prevTxId={prevTxId}
          showNavigation={showNavigation}
          onNextTx={(txId) => onNextTx(txId)}
          firstTx={firstTx}
          lastTx={lastTx}
          ofText={ofText}
          requestsWaitingText={requestsWaitingText}
        />
        <ConfirmPageContainerHeader
          showEdit={showEdit}
          onEdit={() => onEdit()}
          showAccountInHeader={showAccountInHeader}
          accountAddress={fromAddress}
        >
          {hideSenderToRecipient ? null : (
            <SenderToRecipient
              senderName={fromName}
              senderAddress={fromAddress}
              recipientName={toName}
              recipientAddress={toAddress}
              recipientEns={toEns}
              recipientNickname={toNickname}
              assetImage={renderAssetImage ? assetImage : undefined}
            />
          )}
        </ConfirmPageContainerHeader>
        {contentComponent || (
          <ConfirmPageContainerContent
            action={action}
            title={title}
            titleComponent={titleComponent}
            subtitleComponent={subtitleComponent}
            hideSubtitle={hideSubtitle}
            detailsComponent={detailsComponent}
            dataComponent={dataComponent}
            errorMessage={errorMessage}
            errorKey={errorKey}
            identiconAddress={identiconAddress}
            nonce={nonce}
            assetImage={assetImage}
            warning={warning}
            onCancelAll={onCancelAll}
            onCancel={onCancel}
            cancelText={this.context.t('reject')}
            onSubmit={onSubmit}
            submitText={this.context.t('confirm')}
            disabled={disabled}
            unapprovedTxCount={unapprovedTxCount}
            rejectNText={this.context.t('rejectTxsN', [unapprovedTxCount])}
            origin={origin}
            ethGasPriceWarning={ethGasPriceWarning}
          />
        )}
        {contentComponent && (
          <PageContainerFooter
            onCancel={onCancel}
            cancelText={this.context.t('reject')}
            onSubmit={onSubmit}
            submitText={this.context.t('confirm')}
            submitButtonType="confirm"
            disabled={disabled}
          >
            {unapprovedTxCount > 1 && (
              <a onClick={onCancelAll}>
                {this.context.t('rejectTxsN', [unapprovedTxCount])}
              </a>
            )}
          </PageContainerFooter>
        )} */}
      </div>
    );
  }
}
