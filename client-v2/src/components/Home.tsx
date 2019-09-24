import React from 'react';
import { Link } from 'react-router-dom';

import { priorities, editionPriorities } from 'constants/priorities';
import HomeContainer from './layout/HomeContainer';

const renderPriority = (priority: string) => (
  <li key={priority}>
    <Link to={`/${priority}`}>{priority}</Link>
  </li>
);
const renderEditionPriority = (editionPriority: string) => (
  <li key={editionPriority}>
    <Link to={`/manage-editions/${editionPriorities[editionPriority].address}`}>{editionPriorities[editionPriority].description}</Link>
  </li>
);
const Home = () => (
  <HomeContainer>
    <h3>Front priorities</h3>
    <ul>{Object.keys(priorities).map(renderPriority)}</ul>

    <h3>Manage editions</h3>
    <ul>{Object.keys(editionPriorities).map(renderEditionPriority)}</ul>
  </HomeContainer>
);

export default Home;
