// @flow

import React from 'react';
import { Link } from 'react-router-dom';
import type { Priorities } from 'Types/Priority';
import { priorities } from 'Constants/priorities';

const renderPriority = (priority: string) => (
  <li key={priority}>
    <Link to={`/${priority}`}>{priority}</Link>
  </li>
);
const Home = () => (
  <ul>{Object.keys((priorities: Priorities)).map(renderPriority)}</ul>
);

export default Home;
