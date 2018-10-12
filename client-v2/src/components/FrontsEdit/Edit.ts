

import { Dispatch } from 'types/Store';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Match, RouterHistory } from 'react-router-dom';
import styled from 'styled-components';

import getFrontsConfig from 'actions/Fronts';
<<<<<<< HEAD
import {
  editorOpenFront,
  selectEditorFrontsByPriority
} from 'bundles/frontsUIBundle';
import type { State } from 'types/State';
import type { ActionError } from 'types/Action';
=======
import { editorOpenFront, selectEditorFronts } from 'bundles/frontsUIBundle';
import { State } from 'types/State';
import { ActionError } from 'types/Action';
>>>>>>> Remove 'import type' and exact types programmatically
import FrontContainer from './FrontContainer';
import FeedSection from '../FeedSection';
import ErrorBannner from '../ErrorBanner';
import SectionContainer from '../layout/SectionContainer';
import SectionsContainer from '../layout/SectionsContainer';
import FrontsMenu from './FrontsMenu';
import PressFailAlert from '../PressFailAlert';

type Props = {
  match: Match,
  error: ActionError,
  history: RouterHistory,
  frontIds: string[],
  staleFronts: { string: boolean },
  editorOpenFront: (frontId: string) => void,
  getFrontsConfig: () => void
};

const FrontsEditContainer = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const SingleFrontContainer = styled('div')`
  height: 100%;
  min-width: 1011px;
`;

const FeedContainer = SectionContainer.extend`
  height: 100%;
`;

const FrontsContainer = SectionContainer.extend`
  overflow-x: scroll;
`;

class FrontsEdit extends React.Component<Props> {
  componentDidMount() {
    this.props.getFrontsConfig();
  }

  render() {
    return (
      <FrontsEditContainer>
        <ErrorBannner error={this.props.error} />
        <PressFailAlert staleFronts={this.props.staleFronts} />
        <SectionsContainer>
          <FeedContainer>
            <FeedSection />
          </FeedContainer>
          <FrontsContainer>
            {this.props.frontIds.map(frontId => (
              <SingleFrontContainer key={frontId}>
                <FrontContainer
                  key={frontId}
                  history={this.props.history}
                  priority={this.props.match.params.priority || ''}
                  frontId={frontId}
                />
              </SingleFrontContainer>
            ))}
          </FrontsContainer>
        </SectionsContainer>
        <FrontsMenu onSelectFront={this.props.editorOpenFront} />
      </FrontsEditContainer>
    );
  }
}

const mapStateToProps = (state: State, props: Props) => ({
  error: state.error,
  staleFronts: state.staleFronts,
  frontIds: selectEditorFrontsByPriority(
    state,
    props.match.params.priority || ''
  )
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      editorOpenFront,
      getFrontsConfig
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontsEdit);
