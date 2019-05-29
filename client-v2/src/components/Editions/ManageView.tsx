import React from 'react';
import { styled, Theme } from 'constants/theme';
import HomeContainer from '../layout/HomeContainer';
import ManageEdition from './ManageEdition';

const ManagedView = () => (
  <HomeContainer>
    <h1>Editions</h1>
    <ManageEdition />
  </HomeContainer>
);

export default ManagedView;
