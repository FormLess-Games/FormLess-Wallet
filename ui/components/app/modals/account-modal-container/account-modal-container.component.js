import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import Identicon from '../../../ui/identicon';
import { useI18nContext } from '../../../../hooks/useI18nContext';

export default function AccountModalContainer(props, context) {
  const t = useI18nContext();
  const {
    className,
    selectedIdentity,
    showBackButton,
    backButtonAction,
    hideModal,
    children,
  } = props;

  return (
    <div className={classnames(className, 'account-modal')}>
      <div className="account-modal__container">
        <div className="page-container-header">
          <img
            onClick={() => hideModal()}
            className="return"
            src="./images/return.png"
          />
          <div className="content">{t('addressDeatil')}</div>
        </div>
        {/* {showBackButton && (
          <div className="account-modal__back" onClick={backButtonAction}>
            <i className="fa fa-angle-left fa-lg" />
            <span className="account-modal__back-text">
              {context.t('back')}
            </span>
          </div>
        )} */}
        {children}
      </div>
    </div>
  );
}

AccountModalContainer.contextTypes = {
  t: PropTypes.func,
};

AccountModalContainer.defaultProps = {
  showBackButton: false,
  children: null,
  backButtonAction: undefined,
};

AccountModalContainer.propTypes = {
  className: PropTypes.string,
  selectedIdentity: PropTypes.object.isRequired,
  showBackButton: PropTypes.bool,
  backButtonAction: PropTypes.func,
  hideModal: PropTypes.func.isRequired,
  children: PropTypes.node,
};
