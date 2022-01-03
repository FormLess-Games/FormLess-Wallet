import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import MetaFoxLogo from '../../../components/ui/metafox-logo';
import {
  INITIALIZE_CREATE_PASSWORD_ROUTE,
  INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE,
  INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE2,
  INITIALIZE_SEED_PHRASE_INTRO_ROUTE,
  INITIALIZE_SEED_PHRASE_ROUTE,
} from '../../../helpers/constants/routes';
import NewAccount from './new-account';
import ImportWithSeedPhrase from './import-with-seed-phrase';
import ImportWithSeedPhrase2 from './import-with-seed-phrase2';

export default class CreatePassword extends PureComponent {
  static propTypes = {
    history: PropTypes.object,
    isInitialized: PropTypes.bool,
    onCreateNewAccount: PropTypes.func,
    onCreateNewAccountFromSeed: PropTypes.func,
  };

  componentDidMount() {
    const { isInitialized, history } = this.props;
  }

  render() {
    const { onCreateNewAccount, onCreateNewAccountFromSeed } = this.props;

    return (
      <div className="first-time-flow__wrapper">
        <Switch>
          <Route
            exact
            path={INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE}
            render={(routeProps) => (
              <ImportWithSeedPhrase
                {...routeProps}
                onSubmit={onCreateNewAccountFromSeed}
              />
            )}
          />
          <Route
            exact
            path={INITIALIZE_CREATE_PASSWORD_ROUTE}
            render={(routeProps) => (
              <NewAccount {...routeProps} onSubmit={onCreateNewAccount} />
            )}
          />
          <Route
            exact
            path={INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE2}
            render={(routeProps) => (
              <ImportWithSeedPhrase2
                {...routeProps}
                onSubmit={onCreateNewAccountFromSeed}
              />
            )}
          />
        </Switch>
      </div>
    );
  }
}
