// @flow

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import type { Priorities } from 'types/Priority';
import { priorities } from 'constants/priorities';

const HomeContainer = styled('div')`
  padding-top: 60px;
`;

const renderPriority = (priority: string) => (
  <li key={priority}>
    <Link to={`/${priority}`}>{priority}</Link>
  </li>
);
const Home = () => (
  <HomeContainer>
    <ul>{Object.keys((priorities: Priorities)).map(renderPriority)}</ul>
  </HomeContainer>
);

export default Home;
