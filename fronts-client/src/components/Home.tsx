import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { priorities } from 'constants/priorities';
import { EditionPriority } from 'types/Priority';
import HomeContainer from './layout/HomeContainer';
import {
  selectAvailableEditions,
  selectEditionsPermission,
} from 'selectors/configSelectors';
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

const Home = ({ availableEditions, editEditionsIsPermitted }: IProps) => (
  <HomeContainer>
    <h3>Front priorities</h3>
    <ul>{Object.keys(priorities).map(renderPriority)}</ul>
    <h3>Manage editions</h3>
    <ul>
      {!editEditionsIsPermitted ? (
        <p>
          You do not have permission to edit Editions. Please contact
          central.production@guardian.co.uk to request access.
        </p> /*TODO We can try string to be in Config and display dynamically here? "edit Editions" or "edit Feast Editions" or "edit Fronts" */
      ) : (
        availableEditions &&
        availableEditions
          .sort((a, b) =>
            a.editionType === b.editionType ? (a.title < b.title ? 0 : 1) : 1
          )
          .map(renderEditionPriority)
      )}
    </ul>
    <h3>Manage edition list</h3>
    <ul>
      <li>
        <a href="/editions-api/editions">View Editions json metadata</a>
      </li>
      <li>
        <a href="/editions-api/republish-editions">Republish</a>
      </li>
    </ul>
  </HomeContainer>
);

const mapStateToProps = (state: State) => ({
  availableEditions: selectAvailableEditions(state),
  editEditionsIsPermitted: selectEditionsPermission(state)['edit-editions'],
});

export default connect(mapStateToProps)(Home);
