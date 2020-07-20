import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { priorities, editionPriorities } from 'constants/priorities';
import HomeContainer from './layout/HomeContainer';
import { selectAvailableEditions } from 'selectors/configSelectors';
import type { State } from 'types/State';

const renderPriority = (priority: string) => (
  <li key={priority}>
    <Link to={`/${priority}`}>{priority}</Link>
  </li>
);
const renderEditionPriority = (editionPriority: string) => (
  <li key={editionPriority}>
    <Link to={`/manage-editions/${editionPriorities[editionPriority].address}`}>
      {editionPriorities[editionPriority].description}
    </Link>
  </li>
);

type IProps = ReturnType<typeof mapStateToProps>

const Home = ({ availableEditions }: IProps) => (
  <HomeContainer>
    <h3>Front priorities</h3>
    <ul>{Object.keys(priorities).map(renderPriority)}</ul>

    <h3>Manage editions</h3>
    <ul>{Object.keys(editionPriorities).map(renderEditionPriority)}</ul>
  </HomeContainer>
);

const mapStateToProps = (state: State) => ({
  availableEditions: selectAvailableEditions(state)
});

export default connect(mapStateToProps)(Home);
