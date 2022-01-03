/* eslint-disable no-negated-condition */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import copyToClipboard from 'copy-to-clipboard';
import { requestRevealSeedWords } from '../../store/actions';
import ExportTextContainer from '../../components/ui/export-text-container';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
// import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { exportAsFile } from '../../helpers/utils/util';
import Tooltip from '../../components/ui/tooltip';

import Button from '../../components/ui/button';

const PASSWORD_PROMPT_SCREEN = 'PASSWORD_PROMPT_SCREEN';
const REVEAL_SEED_SCREEN = 'REVEAL_SEED_SCREEN';

class RevealSeedPage extends Component {
  state = {
    screen: PASSWORD_PROMPT_SCREEN,
    password: '',
    seedWords: null,
    error: null,
    isPassword: true,
    copied: false,
  };

  componentDidMount() {
    const passwordBox = document.getElementById('password-box');
    if (passwordBox) {
      passwordBox.focus();
    }
    this.copyTimeout = null;
  }

  componentWillUnmount() {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
      this.copyTimeout = null;
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ seedWords: null, error: null });
    this.props
      .requestRevealSeedWords(this.state.password)
      .then((seedWords) =>
        this.setState({ seedWords, screen: REVEAL_SEED_SCREEN }),
      )
      .catch((error) => this.setState({ error: error.message }));
  }

  renderWarning() {
    return (
      <div className="page-container__warning-container">
        <img
          className="page-container__warning-icon"
          src="images/warning.svg"
          alt=""
        />
        <div className="page-container__warning-message">
          <div className="page-container__warning-title">
            {this.context.t('revealSeedWordsWarningTitle')}
          </div>
          <div>{this.context.t('revealSeedWordsWarning')}</div>
        </div>
      </div>
    );
  }

  renderContent() {
    return this.state.screen === PASSWORD_PROMPT_SCREEN
      ? this.renderPasswordPromptContent()
      : this.renderRevealSeedContent();
  }

  renderPasswordPromptContent() {
    const { t } = this.context;

    return (
      <form onSubmit={(event) => this.handleSubmit(event)}>
        <label className="input-label" htmlFor="password-box">
          {t('enterPasswordContinue')}
        </label>
        <div className="input-group">
          <input
            type="password"
            placeholder={t('password')}
            id="password-box"
            value={this.state.password}
            onChange={(event) =>
              this.setState({ password: event.target.value })
            }
            className={classnames('form-control', {
              'form-control--error': this.state.error,
            })}
          />
        </div>
        {this.state.error && (
          <div className="reveal-seed__error">{this.state.error}</div>
        )}
      </form>
    );
  }

  renderRevealSeedContent() {
    const { t } = this.context;

    return (
      <div>
        <label className="reveal-seed__label">
          {t('yourPrivateSeedPhrase')}
        </label>
        <ExportTextContainer text={this.state.seedWords} />
      </div>
    );
  }

  renderFooter() {
    return this.state.screen === PASSWORD_PROMPT_SCREEN
      ? this.renderPasswordPromptFooter()
      : this.renderRevealSeedFooter();
  }

  renderPasswordPromptFooter() {
    return (
      <div className="page-container__footer">
        <footer>
          <Button
            type="default"
            large
            className="page-container__footer-button"
            onClick={() =>
              this.props.history.push(this.props.mostRecentOverviewPage)
            }
          >
            {this.context.t('cancel')}
          </Button>
          <Button
            type="secondary"
            large
            className="page-container__footer-button"
            onClick={(event) => this.handleSubmit(event)}
            disabled={this.state.password === ''}
          >
            {this.context.t('next')}
          </Button>
        </footer>
      </div>
    );
  }

  renderRevealSeedFooter() {
    return (
      <div className="page-container__footer">
        <Button
          type="default"
          large
          className="page-container__footer-button"
          onClick={() =>
            this.props.history.push(this.props.mostRecentOverviewPage)
          }
        >
          {this.context.t('close')}
        </Button>
      </div>
    );
  }

  render() {
    const { password, seedWords, error, isPassword, copied } = this.state;
    console.log(seedWords, this, 'seedWordsseedWordsseedWords');
    return (
      <div className="page-container export-mnemonic-words">
        <div className="page-container-header">
          <img
            onClick={() =>
              this.props.history.push(this.props.mostRecentOverviewPage)
            }
            className="return"
            src="./images/return.png"
          />
          <div className="content">{this.context.t('exportAccountWords')}</div>
        </div>
        <div className="page-container-export-title">
          {this.context.t('walletSafetyTips7')}
        </div>
        {!seedWords ? (
          <>
            <div className="new-account-content-addAccount bn">
              <div className="name">
                {this.context.t('enterPasswordContinue')}
              </div>
              <div className="new-account-content-input">
                <input
                  value={password}
                  type={isPassword ? 'password' : 'text'}
                  placeholder={this.context.t('password')}
                  onChange={(event) =>
                    this.setState({ password: event.target.value, error: '' })
                  }
                />
                <img
                  onClick={() => this.setState({ isPassword: !isPassword })}
                  className="an"
                  src={isPassword ? './images/unsee.png' : './images/see.png'}
                />
              </div>
            </div>
            <div className="rs-revealSeed-error">{error}</div>
            <div className="export-mnemonic-words-tip">
              {this.context.t('backupApprovalNotice')}
            </div>
            <div className="new-account-btn-list bn">
              <div
                onClick={() =>
                  this.props.history.push(this.props.mostRecentOverviewPage)
                }
              >
                {this.context.t('cancel')}
              </div>
              <div className="an" onClick={(event) => this.handleSubmit(event)}>
                {this.context.t('next')}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="export-mnemonic-text">
              <div className="title">{this.context.t('yourMnemonics')}</div>
              <div className="export-mnemonic-textarea">
                <textarea value={seedWords}></textarea>
              </div>
            </div>
            <div className="export-mnemonic-export-list">
              <Tooltip
                position="bottom"
                title={
                  copied
                    ? this.context.t('copiedExclamation')
                    : this.context.t('copyToClipboard')
                }
              >
                <div
                  onClick={() => {
                    this.setState({ copied: true });
                    this.copyTimeout = setTimeout(
                      () => this.setState({ copied: false }),
                      3000,
                    );
                    copyToClipboard(seedWords);
                  }}
                >
                  {this.context.t('copy')}
                </div>
              </Tooltip>
              <div
                onClick={() =>
                  exportAsFile('seedWords.text', seedWords, 'text/plain')
                }
              >
                {this.context.t('saveTxt')}
              </div>
            </div>
            <div className="export-mnemonic-words-tip">
              {this.context.t('backupApprovalNotice')}
            </div>
            <div
              onClick={() =>
                this.props.history.push(this.props.mostRecentOverviewPage)
              }
              className="export-mnemonic-close"
            >
              {this.context.t('close')}
            </div>
          </>
        )}
        {/* <div className="page-container__header">
          <div className="page-container__title">
            {this.context.t('revealSeedWordsTitle')}
          </div>
          <div className="page-container__subtitle">
            {this.context.t('revealSeedWordsDescription')}
          </div>
        </div> */}
        {/* <div className="page-container__content">
          {this.renderWarning()}
          <div className="reveal-seed__content">{this.renderContent()}</div>
        </div>
        {this.renderFooter()} */}
      </div>
    );
  }
}

RevealSeedPage.propTypes = {
  requestRevealSeedWords: PropTypes.func,
  history: PropTypes.object,
  mostRecentOverviewPage: PropTypes.string.isRequired,
};

RevealSeedPage.contextTypes = {
  t: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    mostRecentOverviewPage: getMostRecentOverviewPage(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    requestRevealSeedWords: (password) =>
      dispatch(requestRevealSeedWords(password)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RevealSeedPage);
