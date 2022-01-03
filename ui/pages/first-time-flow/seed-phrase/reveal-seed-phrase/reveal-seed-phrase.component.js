import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Box from '../../../../components/ui/box';
import LockIcon from '../../../../components/ui/lock-icon';
import Button from '../../../../components/ui/button';
import Snackbar from '../../../../components/ui/snackbar';
import {
  INITIALIZE_CONFIRM_SEED_PHRASE_ROUTE,
  DEFAULT_ROUTE,
  INITIALIZE_SEED_PHRASE_INTRO_ROUTE,
  INITIALIZE_CREATE_PASSWORD_ROUTE,
} from '../../../../helpers/constants/routes';
import { exportAsFile } from '../../../../helpers/utils/util';
import { returnToOnboardingInitiator } from '../../onboarding-initiator-util';

export default class RevealSeedPhrase extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object,
    seedPhrase: PropTypes.string,
    setSeedPhraseBackedUp: PropTypes.func,
    setCompletedOnboarding: PropTypes.func,
    onboardingInitiator: PropTypes.exact({
      location: PropTypes.string,
      tabId: PropTypes.number,
    }),
  };

  state = {
    isShowingSeedPhrase: false,
  };

  handleExport = () => {
    exportAsFile('', this.props.seedPhrase, 'text/plain');
  };

  handleNext = () => {
    const { history } = this.props;

    this.context.metricsEvent({
      eventOpts: {
        category: 'Onboarding',
        action: 'Seed Phrase Setup',
        name: 'Advance to Verify',
      },
    });

    history.push(INITIALIZE_CONFIRM_SEED_PHRASE_ROUTE);
  };

  handleSkip = async () => {
    const {
      history,
      setSeedPhraseBackedUp,
      setCompletedOnboarding,
      onboardingInitiator,
    } = this.props;

    this.context.metricsEvent({
      eventOpts: {
        category: 'Onboarding',
        action: 'Seed Phrase Setup',
        name: 'Remind me later',
      },
    });

    await Promise.all([setCompletedOnboarding(), setSeedPhraseBackedUp(false)]);

    if (onboardingInitiator) {
      await returnToOnboardingInitiator(onboardingInitiator);
    }
    history.push(DEFAULT_ROUTE);
  };

  renderSecretWordsContainer() {
    const { t } = this.context;
    const { seedPhrase } = this.props;
    const { isShowingSeedPhrase } = this.state;

    return (
      <div className="reveal-seed-phrase__secret">
        <div
          className={classnames(
            'reveal-seed-phrase__secret-words notranslate',
            {
              'reveal-seed-phrase__secret-words--hidden': !isShowingSeedPhrase,
            },
          )}
        >
          {seedPhrase}
        </div>
        {!isShowingSeedPhrase && (
          <div
            className="reveal-seed-phrase__secret-blocker"
            onClick={() => {
              this.context.metricsEvent({
                eventOpts: {
                  category: 'Onboarding',
                  action: 'Seed Phrase Setup',
                  name: 'Revealed Words',
                },
              });
              this.setState({ isShowingSeedPhrase: true });
            }}
          >
            <LockIcon width="28px" height="35px" fill="#FFFFFF" />
            <div className="reveal-seed-phrase__reveal-button">
              {t('clickToRevealSeed')}
            </div>
          </div>
        )}
      </div>
    );
  }

  render() {
    const { t } = this.context;
    const { isShowingSeedPhrase } = this.state;
    const { history, onboardingInitiator, seedPhrase } = this.props;

    return (
      <div className="reveal-seed-phrase">
        <div className="seed-phrase__sections">
          <div className="seed-phrase__main">
            {/* <Box marginBottom={4}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  history.push(INITIALIZE_SEED_PHRASE_INTRO_ROUTE);
                }}
              >
                {`< ${t('back')}`}
              </a>
              <span className="title">Formless</span>
            </Box> */}

            <div className="page-container-header">
              <img
                onClick={() =>
                  this.props.history.push(INITIALIZE_CREATE_PASSWORD_ROUTE)
                }
                className="return"
                src="./images/return.png"
              />
              <div className="content">Formless</div>
            </div>

            <div className="first-time-flow__states">
              <div className="first-time-flow__states-li an">
                <span>1</span>
                <p>{t('setPassword')}</p>
              </div>
              <img src="./images/next.png" />
              <div className="first-time-flow__states-li an">
                <span>2</span>
                <p>{t('backupsWords')}</p>
              </div>
              <img src="./images/next.png" />
              <div className="first-time-flow__states-li">
                <span>3</span>
                <p>{t('validateWords')}</p>
              </div>
            </div>

            <div className="first-time-flow__header">{t('yourMnemonics')}</div>
            <div className="first-time-flow__list">
              {seedPhrase?.split(' ').map((item, index) => (
                <div key={index} className="first-time-flow__li">
                  <span>{index + 1}</span>
                  <em>{item}</em>
                </div>
              ))}
            </div>
            <div className="first-time-flow__tip">
              <img src="./images/tip.png" />
              <div className="tip-info">
                <p>{t('walletSafetyTips5')}</p>
                <p>{t('walletSafetyTips8')}</p>
              </div>
            </div>
            <div className="first-time-flow__bot-btn">
              <Button
                type="secondary"
                className="first-time-flow__button an"
                onClick={this.handleExport}
              >
                <img src="./images/down.png" />
                {t('downMnemonics')}
              </Button>
              <Button
                type="secondary"
                className="first-time-flow__button"
                onClick={this.handleNext}
              >
                {t('writtenItDown')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
