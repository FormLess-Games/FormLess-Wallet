/* eslint-disable no-nested-ternary */
/* eslint-disable no-negated-condition */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FileInput from 'react-simple-file-input';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
// import Dropdown from '../../../components/ui/dropdown';
import * as actions from '../../../store/actions';
import { getMetaMaskAccounts } from '../../../selectors';
import { getMostRecentOverviewPage } from '../../../ducks/history/history';
// Subviews
import JsonImportView from './json';
import PrivateKeyImportView from './private-key';

class AccountImportSubview extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  state = {
    privateKey: '',
    isDisabled: true,
    fileContents: '',
    isEmpty: true,
    fileName: '',
    selectType: false,
  };

  inputRef = React.createRef();

  componentWillUnmount() {
    // cancel warning notice
    const { displayWarning } = this.props;
    displayWarning(null);
  }

  getMenuItemTexts() {
    return [this.context.t('privateKey'), this.context.t('jsonFile')];
  }

  renderImportView() {
    const { type } = this.state;
    const menuItems = this.getMenuItemTexts();
    const current = type || menuItems[0];

    switch (current) {
      case this.context.t('privateKey'):
        return <PrivateKeyImportView />;
      case this.context.t('jsonFile'):
        return <JsonImportView />;
      default:
        return <JsonImportView />;
    }
  }

  handleChange(e) {
    const { displayWarning } = this.props;
    const value = e.target.value.trim();
    this.setState({
      privateKey: value,
      isDisabled: value === '',
    });
    displayWarning(null);
  }

  createNewKeychain() {
    if (this.state.isDisabled) {
      return;
    }
    const privateKey = this.inputRef.current.value;
    const {
      importNewAccount,
      history,
      displayWarning,
      mostRecentOverviewPage,
      setSelectedAddress,
      firstAddress,
    } = this.props;

    importNewAccount('Private Key', [privateKey])
      .then(({ selectedAddress }) => {
        if (selectedAddress) {
          this.context.metricsEvent({
            eventOpts: {
              category: 'Accounts',
              action: 'Import Account',
              name: 'Imported Account with Private Key',
            },
          });
          history.push(mostRecentOverviewPage);
          displayWarning(null);
        } else {
          displayWarning('Error importing account.');
          this.context.metricsEvent({
            eventOpts: {
              category: 'Accounts',
              action: 'Import Account',
              name: 'Error importing with Private Key',
            },
          });
          setSelectedAddress(firstAddress);
        }
      })
      .catch((err) => {
        if (err) {
          console.log('error', err.message);
          let errorText = err?.message || '';
          if (
            errorText ===
            'Expected private key to be an Uint8Array with length 32'
          ) {
            errorText = this.context.t('uint8ArrayError');
          }

          displayWarning(errorText);
        }

        // err && displayWarning(err.message || err);
      });
  }

  checkInputEmpty() {
    const password = this.inputRef.current.value;
    let isEmpty = true;
    if (password !== '') {
      isEmpty = false;
    }
    this.setState({ isEmpty });
  }

  createKeyringOnEnter(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.createNewKeychain();
    }
  }

  createJSONOnEnter(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.createNewjson();
    }
  }

  onLoad(event) {
    const { displayWarning } = this.props;
    console.log('onLoad', event);
    this.setState({
      fileContents: event.target.result,
    });
    displayWarning(null);
  }

  onChangeFileInput(e) {
    // console.log('onChangeFileInput', e);
    this.setState({
      fileName: e.name,
    });
  }

  createNewjson() {
    const {
      firstAddress,
      displayWarning,
      history,
      importNewJsonAccount,
      mostRecentOverviewPage,
      setSelectedAddress,
    } = this.props;
    const { fileContents } = this.state;

    const password = this.inputRef.current.value;

    if (!fileContents || !password) {
      // const message = this.context.t('needImportFile');
      // displayWarning(message);
      return;
    }

    importNewJsonAccount([fileContents, password])
      .then(({ selectedAddress }) => {
        if (selectedAddress) {
          history.push(mostRecentOverviewPage);
          this.context.metricsEvent({
            eventOpts: {
              category: 'Accounts',
              action: 'Import Account',
              name: 'Imported Account with JSON',
            },
          });
          displayWarning(null);
        } else {
          displayWarning('Error importing account.');
          this.context.metricsEvent({
            eventOpts: {
              category: 'Accounts',
              action: 'Import Account',
              name: 'Error importing JSON',
            },
          });
          setSelectedAddress(firstAddress);
        }
      })
      .catch((err) => {
        if (err) {
          console.log('error', err.message);
          let errorText = err?.message || '';
          if (errorText === 'Not a V3 wallet') {
            errorText = this.context.t('notV3Wallet');
          }

          displayWarning(errorText);
        }

        // err && displayWarning(err.message || err)
      });
  }

  render() {
    const { error, displayWarning, history } = this.props;
    const menuItems = this.getMenuItemTexts();
    const {
      type,
      isDisabled,
      privateKey,
      isEmpty,
      fileContents,
      selectType,
    } = this.state;
    const current = type || menuItems[0];

    const enabled = !isEmpty && fileContents !== '';
    return (
      <>
        <div className="new-account-header">
          <img
            onClick={() => history.go(-1)}
            className="return"
            src="./images/return.png"
          />
          <div className="content">{this.context.t('importWallet')}</div>
        </div>
        <div className="new-account-import-form">
          <div className="new-account-import-newDisclaimer">
            {this.context.t('importAccountMsg')}
          </div>
          <div className="new-account-import-key">
            <div className="new-account-content-addAccount cn">
              <div className="name">{this.context.t('selectType')}</div>
              <div
                onClick={() => this.setState({ selectType: true })}
                className="new-account-content-input"
              >
                <input value={type || menuItems[0]} disabled />
                <img className="account-down" src="./images/down3.png" />
              </div>
              <div
                className="rs-addAccount-list"
                style={{ display: selectType ? 'block' : 'none' }}
              >
                {menuItems.map((text, index) => (
                  <div
                    onClick={() => {
                      this.setState({
                        type: text,
                        isDisabled: true,
                        isEmpty: true,
                        selectType: false,
                      });
                      displayWarning(null);
                    }}
                    key={text}
                    className={`${
                      type
                        ? text === type
                          ? 'an'
                          : ''
                        : index === 0
                        ? 'an'
                        : ''
                    } rs-addAccount-li`}
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
            {current === this.context.t('privateKey') ? (
              <div className="new-account-content-addAccount bn">
                <div className="name">{this.context.t('pastePrivateKey')}</div>
                <div className="new-account-content-input">
                  <input
                    ref={this.inputRef}
                    onChange={(e) => this.handleChange(e)}
                    onKeyPress={this.createKeyringOnEnter.bind(this)}
                    vlaue={privateKey}
                    placeholder={this.context.t('pastePrivateKey')}
                  />
                </div>
              </div>
            ) : (
              <>
                <label>
                  <FileInput
                    accept=".json"
                    readAs="text"
                    hidden="hidden"
                    onLoad={this.onLoad.bind(this)}
                    onChange={this.onChangeFileInput.bind(this)}
                    style={{
                      display: 'none',
                    }}
                  />
                  <span className="new-account-import-form__input-file">
                    {this.context.t('inputFile')}
                  </span>
                  <span>{this.state.fileName}</span>
                </label>
                <div className="new-account-content-addAccount">
                  <div className="name">{this.context.t('enterPassword')}</div>
                  <div className="new-account-content-input">
                    <input
                      id="json-password-box"
                      type="password"
                      onKeyPress={this.createJSONOnEnter.bind(this)}
                      placeholder={this.context.t('enterPassword')}
                      onChange={() => this.checkInputEmpty()}
                      ref={this.inputRef}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="rs-export-key-error">{error}</div>
          </div>

          <div
            className={`new-account-btn-list ${
              current === this.context.t('privateKey') ? 'an' : 'cn'
            }`}
          >
            <div onClick={() => history.go(-1)}>{this.context.t('cancel')}</div>
            {current === this.context.t('privateKey') ? (
              <div
                onClick={() => this.createNewKeychain()}
                className={`an ${isDisabled ? 'disabled' : ''}`}
              >
                {this.context.t('create')}
              </div>
            ) : (
              <div
                onClick={() => this.createNewjson()}
                className={`an ${!enabled ? 'disabled' : ''}`}
              >
                {this.context.t('create')}
              </div>
            )}
          </div>

          {/* <div className="new-account-import-form__select-section">
          <div className="new-account-import-form__select-label">
            {this.context.t('selectType')}
          </div>
          <Dropdown
            className="new-account-import-form__select"
            options={menuItems.map((text) => ({ value: text }))}
            selectedOption={type || menuItems[0]}
            onChange={(value) => {
              this.setState({ type: value });
            }}
          />
        </div>
        {this.renderImportView()} */}
        </div>
      </>
    );
  }
}

AccountImportSubview.propTypes = {
  error: PropTypes.string,
  displayWarning: PropTypes.func,
  firstAddress: PropTypes.string,
  importNewJsonAccount: PropTypes.func,
  history: PropTypes.object,
  setSelectedAddress: PropTypes.func,
  importNewAccount: PropTypes.func,
  mostRecentOverviewPage: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
    error: state.appState.warning,
    firstAddress: Object.keys(getMetaMaskAccounts(state))[0],
    mostRecentOverviewPage: getMostRecentOverviewPage(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    displayWarning: (warning) => dispatch(actions.displayWarning(warning)),
    importNewJsonAccount: (options) =>
      dispatch(actions.importNewAccount('JSON File', options)),
    setSelectedAddress: (address) =>
      dispatch(actions.setSelectedAddress(address)),
    importNewAccount: (strategy, [privateKey]) => {
      return dispatch(actions.importNewAccount(strategy, [privateKey]));
    },
  };
};

AccountImportSubview.contextTypes = {
  t: PropTypes.func,
  metricsEvent: PropTypes.func,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(AccountImportSubview);
