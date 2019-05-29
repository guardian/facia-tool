import React from 'react';
import HomeContainer from '../layout/HomeContainer';
import ManageEdition from './ManageEdition';

const ManagedView = () => (
  <HomeContainer>
    <h1>Editions</h1>
    <ManageEdition />
  </HomeContainer>
);

export default ManagedView;
