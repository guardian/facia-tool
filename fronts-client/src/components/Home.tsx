import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { priorities } from 'constants/priorities';
import { EditionPriority } from 'types/Priority';
import HomeContainer from './layout/HomeContainer';
import { selectAvailableEditions } from 'selectors/configSelectors';
import type { State } from 'types/State';

const renderPriority = (priority: string) => (
  <li key={priority}>
    <Link to={`/${priority}`}>{priority}</Link>
  </li>
);
const renderEditionPriority = (editionPriority: EditionPriority) => (
  <li key={editionPriority.title}>
    <Link to={`/manage-editions/${editionPriority.edition}`}>
      {editionPriority.title}
    </Link>
  </li>
);

type IProps = ReturnType<typeof mapStateToProps>;

const Home = ({ availableEditions }: IProps) => (
  <HomeContainer>
    <h3>Front priorities</h3>
    <ul>{Object.keys(priorities).map(renderPriority)}</ul>

    <h3>Manage editions</h3>
    <ul>{
      availableEditions &&
        availableEditions
          .sort((a, b) =>
            a.editionType === b.editionType ? (a.title < b.title ? 0 : 1) : 1
          )
          .map(renderEditionPriority)}
    </ul>
  </HomeContainer>
);

const mapStateToProps = (state: State) => ({
  availableEditions: selectAvailableEditions(state)
});

export default connect(mapStateToProps)(Home);
