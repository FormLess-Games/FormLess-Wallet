import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/ui/button';
import Snackbar from '../../../components/ui/snackbar';
import MetaFoxLogo from '../../../components/ui/metafox-logo';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import { returnToOnboardingInitiator } from '../onboarding-initiator-util';

export default class EndOfFlowScreen extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object,
    completionMetaMetricsName: PropTypes.string,
    setCompletedOnboarding: PropTypes.func,
    onboardingInitiator: PropTypes.exact({
      location: PropTypes.string,
      tabId: PropTypes.number,
    }),
  };

  async _beforeUnload() {
    await this._onOnboardingComplete();
  }

  _removeBeforeUnload() {
    window.removeEventListener('beforeunload', this._beforeUnload);
  }

  async _onOnboardingComplete() {
    const { setCompletedOnboarding, completionMetaMetricsName } = this.props;
    await setCompletedOnboarding();
    this.context.metricsEvent({
      eventOpts: {
        category: 'Onboarding',
        action: 'Onboarding Complete',
        name: completionMetaMetricsName,
      },
    });
  }

  onComplete = async () => {
    const { history, onboardingInitiator } = this.props;

    this._removeBeforeUnload();
    await this._onOnboardingComplete();
    if (onboardingInitiator) {
      await returnToOnboardingInitiator(onboardingInitiator);
    }
    history.push(DEFAULT_ROUTE);
  };

  componentDidMount() {
    window.addEventListener('beforeunload', this._beforeUnload.bind(this));
  }

  componentWillUnmount = () => {
    this._removeBeforeUnload();
  };

  render() {
    const { t } = this.context;
    const { onboardingInitiator } = this.props;

    return (
      <div className="end-of-flow">
        <div className="end-of-logo">
          <img src="./images/logo.png" />
          <span>Formless</span>
        </div>
        <div className="end-of-flow__title">
          <img src="./images/success.png" />
          <span>{t('walletCreatedSuccessfully')}</span>
        </div>
        <div className="end-of-flow__tip">{t('walletSafetyTips1')}</div>
        <div className="end-of-flow__describe-title">
          {t('walletSafetyTips7')}
        </div>
        <div className="end-of-flow__describe-li">
          · {t('walletSafetyTips2')}
        </div>
        <div className="end-of-flow__describe-li">
          · {t('walletSafetyTips3')}
        </div>
        <div className="end-of-flow__describe-li">
          · {t('walletSafetyTips4')}
        </div>
        <div className="end-of-flow__describe-li">
          · {t('walletSafetyTips8')}
        </div>
        <Button
          type="primary"
          className="first-time-flow__button end-of-flow__button"
          onClick={this.onComplete}
        >
          {t('endOfFlowMessage10')}
        </Button>
      </div>
    );
  }
}
