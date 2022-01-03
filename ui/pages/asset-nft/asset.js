import React from 'react';
import { useSelector } from 'react-redux';
// import { Redirect, useParams } from 'react-router-dom';
// import { getTokens } from '../../ducks/metamask/metamask';
// import { DEFAULT_ROUTE } from '../../helpers/constants/routes';

import NativeAsset from './asset.container';
// import TokenAsset from './components/token-asset';

const Asset = () => {
  const metamask = useSelector((state) => {
    console.log(state, 'STATESTATESTATE');
    return state.metamask;
  });

  // const token = tokens.find(({ address }) => address === asset);

  return (
    <div className="main-container asset__container">
      <NativeAsset metamask={metamask} />
    </div>
  );
};

export default Asset;
