import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../components/ui/button';
import {
  INITIALIZE_SEED_PHRASE_ROUTE,
  INITIALIZE_SELECT_ACTION_ROUTE,
} from '../../../../helpers/constants/routes';
import TextField from '../../../../components/ui/text-field';

export default class NewAccount extends PureComponent {
  static contextTypes = {
    metricsEvent: PropTypes.func,
    t: PropTypes.func,
  };

  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  };

  state = {
    password: '',
    confirmPassword: '',
    passwordError: '',
    confirmPasswordError: '',
    networkIndex: 0,
    networkList: [
      {
        code: './images/switch-1.png',
        name: 'Ethereum',
      },
      {
        code: './images/switch-2.png',
        name: 'Polygon',
      },
    ],
  };

  isValid() {
    const {
      password,
      confirmPassword,
      passwordError,
      confirmPasswordError,
    } = this.state;

    if (!password || !confirmPassword || password !== confirmPassword) {
      return false;
    }

    if (password.length < 8) {
      return false;
    }

    return !passwordError && !confirmPasswordError;
  }

  handlePasswordChange(password) {
    const { t } = this.context;

    this.setState((state) => {
      const { confirmPassword } = state;
      let passwordError = '';
      let confirmPasswordError = '';

      if (password && password.length < 8) {
        passwordError = this.context.t('passwordLengthLimit');
      }

      if (confirmPassword && password !== confirmPassword) {
        confirmPasswordError = t('passwordsDontMatch');
      }

      return {
        password,
        passwordError,
        confirmPasswordError,
      };
    });
  }

  handleConfirmPasswordChange(confirmPassword) {
    const { t } = this.context;

    this.setState((state) => {
      const { password } = state;
      let confirmPasswordError = '';

      if (password !== confirmPassword) {
        confirmPasswordError = t('passwordsDontMatch');
      }

      return {
        confirmPassword,
        confirmPasswordError,
      };
    });
  }

  handleCreate = async (event) => {
    event.preventDefault();

    if (!this.isValid()) {
      return;
    }

    const { password } = this.state;
    const { onSubmit, history } = this.props;

    try {
      await onSubmit(password);

      this.context.metricsEvent({
        eventOpts: {
          category: 'Onboarding',
          action: 'Create Password',
          name: 'Submit Password',
        },
      });

      history.push(INITIALIZE_SEED_PHRASE_ROUTE);
    } catch (error) {
      this.setState({ passwordError: error.message });
    }
  };

  hancleSetNetword = (index) => {
    this.setState({
      networkIndex: index,
    });
  };

  toggleTermsCheck = () => {
    this.context.metricsEvent({
      eventOpts: {
        category: 'Onboarding',
        action: 'Create Password',
        name: 'Check ToS',
      },
    });
  };

  onTermsKeyPress = ({ key }) => {
    if (key === ' ' || key === 'Enter') {
      this.toggleTermsCheck();
    }
  };

  render() {
    const { t } = this.context;
    const {
      password,
      confirmPassword,
      passwordError,
      confirmPasswordError,
      networkList,
      networkIndex,
    } = this.state;

    return (
      <div>
        {/* <div className="first-time-flow__create-back">
          <a
            onClick={(e) => {
              e.preventDefault();
              this.context.metricsEvent({
                eventOpts: {
                  category: 'Onboarding',
                  action: 'Create Password',
                  name: 'Go Back from Onboarding Create',
                },
              });
              this.props.history.push(INITIALIZE_SELECT_ACTION_ROUTE);
            }}
            href="#"
          >
            {`< ${t('back')}`}
          </a>
          <span className="title">Formless</span>
        </div> */}
        <div className="page-container-header">
          <img
            onClick={() =>
              this.props.history.push(INITIALIZE_SELECT_ACTION_ROUTE)
            }
            className="return"
            src="./images/return.png"
          />
          <div className="content">Formless</div>
        </div>

        <div className="first-time-flow__states">
          <div className="first-time-flow__states-li an">
            <span>1</span>
            <p>{this.context.t('createPassword')}</p>
          </div>
          <img src="./images/next.png" />
          <div className="first-time-flow__states-li">
            <span>2</span>
            <p>{this.context.t('backupsWords')}</p>
          </div>
          <img src="./images/next.png" />
          <div className="first-time-flow__states-li">
            <span>3</span>
            <p>{this.context.t('validateWords')}</p>
          </div>
        </div>
        <div className="first-time-flow__header" style={{ padding: '0 16px' }}>
          {t('createPassword')}
        </div>

        <div className="first-time-flow__network">
          <span>{this.context.t('selectNetword')}：</span>
          <em>{networkList[networkIndex].name}</em>
          <div className="network-list">
            {networkList.map((item, index) => (
              <div
                onClick={() => this.hancleSetNetword(index)}
                key={item.code}
                className={`network-li ${index === networkIndex ? 'an' : ''}`}
              >
                <img src={item.code} />
              </div>
            ))}
          </div>
        </div>

        <form className="first-time-flow__form" onSubmit={this.handleCreate}>
          <TextField
            id="create-password"
            label={t('newPassword')}
            type="password"
            className="first-time-flow__input"
            value={password}
            onChange={(event) => this.handlePasswordChange(event.target.value)}
            error={passwordError}
            autoFocus
            autoComplete="new-password"
            margin="normal"
            fullWidth
            largeLabel
          />
          <TextField
            id="confirm-password"
            label={t('confirmPassword')}
            type="password"
            className="first-time-flow__input"
            value={confirmPassword}
            onChange={(event) =>
              this.handleConfirmPasswordChange(event.target.value)
            }
            error={confirmPasswordError}
            autoComplete="confirm-password"
            margin="normal"
            fullWidth
            largeLabel
          />
          {/* <div
            className="first-time-flow__checkbox-container"
            onClick={this.toggleTermsCheck}
          >
            <div
              className="first-time-flow__checkbox"
              tabIndex="0"
              role="checkbox"
              onKeyPress={this.onTermsKeyPress}
              aria-checked={termsChecked}
              aria-labelledby="ftf-chk1-label"
            >
              {termsChecked ? <i className="fa fa-check fa-2x" /> : null}
            </div>
            <span
              id="ftf-chk1-label"
              className="first-time-flow__checkbox-label"
            >
              {t('acceptTermsOfUse', [
                <a
                  onClick={(e) => e.stopPropagation()}
                  key="first-time-flow__link-text"
                  href="https://metamask.io/terms.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="first-time-flow__link-text">
                    {t('terms')}
                  </span>
                </a>,
              ])}
            </span>
          </div> */}

          <Button
            type="primary"
            className="first-time-flow__button "
            disabled={!this.isValid()}
            onClick={this.handleCreate}
          >
            {t('create')}
          </Button>
        </form>
      </div>
    );
  }
}
