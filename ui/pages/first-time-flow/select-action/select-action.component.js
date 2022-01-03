import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import Button from '../../../components/ui/button';
// import MetaFoxLogo from '../../../components/ui/metafox-logo';
import {
  INITIALIZE_CREATE_PASSWORD_ROUTE,
  INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE,
  INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE2,
} from '../../../helpers/constants/routes';

export default class SelectAction extends PureComponent {
  static propTypes = {
    history: PropTypes.object,
    isInitialized: PropTypes.bool,
    setFirstTimeFlowType: PropTypes.func,
    nextRoute: PropTypes.string,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  componentDidMount() {
    const { history, isInitialized, nextRoute } = this.props;

    if (isInitialized) {
      history.push(nextRoute);
    }
  }

  handleCreate = () => {
    this.props.setFirstTimeFlowType('create');
    this.props.history.push(INITIALIZE_CREATE_PASSWORD_ROUTE);
  };

  handleImport = () => {
    this.props.setFirstTimeFlowType('import');
    this.props.history.push(INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE);
  };

  handleImportKey = () => {
    this.props.setFirstTimeFlowType('importKey');
    this.props.history.push(INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE2);
  };

  render() {
    const { t } = this.context;

    return (
      <div className="select-action">
        {/* <MetaFoxLogo /> */}

        <div className="select-action__wrapper">
          <div className="select-action__body">
            <div className="select-action__body-header">{t('welcomeText')}</div>
            <div className="select-action__body-header-cent">Formless</div>
            <p className="select-action__body-header-info">{t('slogan')}</p>
            <div className="select-action__select-buttons">
              <div
                className="select-action__select-button"
                onClick={this.handleCreate}
              >
                <img src="./images/create.png" alt="" />
                <p>{t('createAWallet')}</p>
              </div>
              <div
                className="select-action__select-button an"
                onClick={this.handleImport}
              >
                <img src="./images/in.png" alt="" />
                <p>{t('importAccountWords')}</p>
              </div>
            </div>
            {/* <div
              className="select-action__select-key"
              onClick={this.handleImportKey}
            >
              <img src="./images/in1.png" />
              <span>{t('importKey')}</span>
            </div> */}
            <div className="select-action__select-network">
              <div className="h"></div>
              <div className="h-title">{t('supportNetwork')}</div>
            </div>
            <div className="select-action__select-network-list">
              <img src="./images/ETH.png" />
              <img src="./images/polygon.png" />
              <img src="./images/flow.png" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
