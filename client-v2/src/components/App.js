// @flow

import React from 'react';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import FrontsEdit from './FrontsEdit/Edit';
import Home from './Home';

const AppContainer = styled('div')`
  background-color: #221133;
  color: white;
  display: flex;
  font-family: 'Helvetica Neue', Helvetica, Arial;
  font-size: 16px;
  font-weight: 100;
  height: 100%;
  width: 100%;
`;

const App = () => (
  <AppContainer>
    <Switch>
      <Route exact path="/:priority/:frontId?" component={FrontsEdit} />
      <Route exact path="/" component={Home} />
    </Switch>
  </AppContainer>
);

export default App;
