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
    <h3>Front priorities</h3>
    <ul>{Object.keys(priorities).map(renderPriority)}</ul>
    <h3>Manage editions</h3>
    <ul>
      <li>
        <Link to={`/manage-editions/daily-edition`}>Daily edition</Link>
      </li>
    </ul>
  </HomeContainer>
);

export default Home;
