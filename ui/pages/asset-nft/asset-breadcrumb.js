import React from 'react';
import PropTypes from 'prop-types';

const AssetBreadcrumb = ({ accountName, assetName, onBack }) => {
  return (
    <button className="asset-breadcrumb" onClick={onBack}>
      <img className="return" src="./images/return.png" />
      <div className="content">
        {accountName} / {assetName}
      </div>
    </button>
  );
};

AssetBreadcrumb.propTypes = {
  accountName: PropTypes.string.isRequired,
  assetName: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default AssetBreadcrumb;
