// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Match, RouterHistory } from 'react-router-dom';
import styled from 'styled-components';

import getFrontsConfig from 'actions/Fronts';
import { editorOpenFront, selectEditorFronts } from 'bundles/frontsUIBundle';
import type { State } from 'types/State';
import type { ActionError } from 'types/Action';
import FrontContainer from './FrontContainer';
import FeedSection from '../FeedSection';
import ErrorBannner from '../ErrorBanner';
import SectionContainer from '../layout/SectionContainer';
import SectionsContainer from '../layout/SectionsContainer';
import FrontsMenu from './FrontsMenu';

type Props = {
  match: Match,
  error: ActionError,
  history: RouterHistory,
  frontIds: string[],
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
  width: 1011px;
`;

const FeedContainer = SectionContainer.extend`
  height: 100%;
`;

class FrontsEdit extends React.Component<Props> {
  componentWillMount() {
    this.props.getFrontsConfig();
  }

  render() {
    return (
      <FrontsEditContainer>
        <ErrorBannner error={this.props.error} />
        <SectionsContainer>
          <FeedContainer>
            <FeedSection />
          </FeedContainer>
          <SectionContainer>
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
          </SectionContainer>
        </SectionsContainer>
        <FrontsMenu onSelectFront={this.props.editorOpenFront} />
      </FrontsEditContainer>
    );
  }
}

const mapStateToProps = (state: State) => ({
  error: state.error,
  frontIds: selectEditorFronts(state)
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
