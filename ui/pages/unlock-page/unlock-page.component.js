import { EventEmitter } from 'events';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import getCaretCoordinates from 'textarea-caret';
// import TextField from '../../components/ui/text-field';
// import Mascot from '../../components/ui/mascot';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';

export default class UnlockPage extends Component {
  static contextTypes = {
    metricsEvent: PropTypes.func,
    t: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object.isRequired,
    isUnlocked: PropTypes.bool,
    onRestore: PropTypes.func,
    onSubmit: PropTypes.func,
    forceUpdateMetamaskState: PropTypes.func,
    showOptInModal: PropTypes.func,
  };

  state = {
    password: '',
    error: null,
    isSee: false,
  };

  submitting = false;

  animationEventEmitter = new EventEmitter();

  UNSAFE_componentWillMount() {
    const { isUnlocked, history } = this.props;

    if (isUnlocked) {
      history.push(DEFAULT_ROUTE);
    }
  }

  handleSubmit = async (event) => {
    event && event.preventDefault();
    event && event.stopPropagation();

    const { password } = this.state;
    const { onSubmit, forceUpdateMetamaskState, showOptInModal } = this.props;

    if (password === '' || this.submitting) {
      return;
    }

    this.setState({ error: null });
    this.submitting = true;

    try {
      await onSubmit(password);
      const newState = await forceUpdateMetamaskState();
      this.context.metricsEvent({
        eventOpts: {
          category: 'Navigation',
          action: 'Unlock',
          name: 'Success',
        },
        isNewVisit: true,
      });

      if (
        newState.participateInMetaMetrics === null ||
        newState.participateInMetaMetrics === undefined
      ) {
        showOptInModal();
      }
    } catch ({ message }) {
      let errorText = '';
      if (message === 'Incorrect password') {
        errorText = this.context.t('incorrectPassword');
        const newState = await forceUpdateMetamaskState();
        this.context.metricsEvent({
          eventOpts: {
            category: 'Navigation',
            action: 'Unlock',
            name: 'Incorrect Password',
          },
          customVariables: {
            numberOfTokens: newState.tokens.length,
            numberOfAccounts: Object.keys(newState.accounts).length,
          },
        });
      }

      this.setState({ error: errorText || message });
      this.submitting = false;
    }
  };

  handleInputChange({ target }) {
    this.setState({ password: target.value, error: null });

    // tell mascot to look at page action
    if (target.getBoundingClientRect) {
      const element = target;
      const boundingRect = element.getBoundingClientRect();
      const coordinates = getCaretCoordinates(element, element.selectionEnd);
      this.animationEventEmitter.emit('point', {
        x: boundingRect.left + coordinates.left - element.scrollLeft,
        y: boundingRect.top + coordinates.top - element.scrollTop,
      });
    }
  }

  renderSubmitButton() {
    const style = {
      backgroundColor: '#037dd6',
      color: 'white',
      marginTop: '20px',
      height: '60px',
      fontWeight: '400',
      boxShadow: 'none',
      borderRadius: '4px',
    };

    return (
      <Button
        type="submit"
        style={style}
        disabled={!this.state.password}
        fullWidth
        variant="contained"
        size="large"
        onClick={this.handleSubmit}
        disableRipple
      >
        {this.context.t('unlock')}
      </Button>
    );
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.handleSubmit();
    }
  }

  render() {
    const { password, error, isSee } = this.state;
    const { t } = this.context;
    const { onRestore } = this.props;

    return (
      <div className="unlock-page__container">
        <div className="unlock-page">
          <h1 className="unlock-page__title an">{t('welcomeText')}</h1>
          <h1 className="unlock-page__small-title">Formless</h1>
          <p className="unlock-page__tip">{t('slogan')}</p>

          <div className="unlock-page__from">
            <div className="unlock-page__text">{t('password')}</div>
            <div className="unlock-page__input">
              <input
                type={isSee ? 'text' : 'password'}
                onChange={(event) => this.handleInputChange(event)}
                placeholder={t('enterPassword')}
                value={password}
                onKeyDown={(e) => this.handleKeyDown(e)}
              />
              <img
                onClick={() => this.setState({ isSee: !isSee })}
                src={isSee ? './images/see.png' : './images/unsee.png'}
              />
            </div>
            <p className="unlock-page__error">{error}</p>
            {this.renderSubmitButton()}
          </div>
          <div className="unlock-page__import-text" onClick={onRestore}>
            {t('importAccountLinkText')}
          </div>
          <div className="unlock-page__select-network">
            <div className="h"></div>
            <div className="h-title">{t('supportNetwork')}</div>
          </div>
          <div className="unlock-page__select-network-list">
            <img src="./images/ETH.png" />
            <img src="./images/polygon.png" />
            <img src="./images/flow.png" />
          </div>
        </div>
      </div>
    );
  }
}
