import React from 'react';
import HomeContainer from '../layout/HomeContainer';
import ManageEdition from './ManageEdition';

const ManageView = () => (
  <HomeContainer>
    <h1>Editions</h1>
    <ManageEdition />
  </HomeContainer>
);

export default ManageView;
