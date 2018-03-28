// @flow

import React from 'react';
import { Link } from 'react-router-dom';
import { priorities } from '../constants/priorities';
import type { Priorities } from '../constants/priorities';

const renderPriority = (priority: string) => (
  <li key={priority}>
    <Link to={`/${priority}`}>{priority}</Link>
  </li>
);
const Home = () => (
  <ul>{Object.keys((priorities: Priorities)).map(renderPriority)}</ul>
);

export default Home;
