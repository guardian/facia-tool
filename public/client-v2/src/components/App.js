// @flow

import React from 'react';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import FrontsEdit from './FrontsEdit/Edit';
import Home from './Home';

const AppContainer = styled('div')`
  align-items: center;
  background-color: #221133;
  color: white;
  display: flex;
  font-family: 'Helvetica Neue', Helvetica, Arial;
  font-size: 40px;
  font-weight: 100;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const App = () => (
  <AppContainer>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/:priority" component={FrontsEdit} />
    </Switch>
  </AppContainer>
);

export default App;
