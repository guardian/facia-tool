import React from 'react';
import { Link } from 'react-router-dom';

import { priorities } from 'constants/priorities';
import HomeContainer from './layout/HomeContainer';

const renderPriority = (priority: string) => (
  <li key={priority}>
    <Link to={`/${priority}`}>{priority}</Link>
  </li>
);
const Home = () => (
  <HomeContainer>
    <ul>{Object.keys(priorities).map(renderPriority)}</ul>
  </HomeContainer>
);

export default Home;
