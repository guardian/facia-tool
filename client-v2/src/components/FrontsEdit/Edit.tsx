import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { match } from 'react-router-dom';
import { styled } from 'constants/theme';
import getFrontsConfig from 'actions/Fronts';
import { selectIsCurrentFrontsMenuOpen } from 'bundles/frontsUIBundle';
import {
  editorOpenFront,
  selectEditorFrontsByPriority
} from 'bundles/frontsUIBundle';
import { State } from 'types/State';
import { ActionError } from 'types/Action';
import FrontContainer from './FrontContainer';
import FeedSection from '../FeedSection';
import ErrorBannner from '../ErrorBanner';
import SectionContainer from '../layout/SectionContainer';
import SectionsContainer from '../layout/SectionsContainer';
import FrontsMenu from './FrontsMenu';
import PressFailAlert from '../PressFailAlert';

export const frontsContainerId = 'fronts-container';
export const createFrontId = (frontId: string) => `front-${frontId}`;

interface Props {
  match: match<{ priority: string }>;
  error: ActionError;
  frontIds: string[];
  staleFronts: { [id: string]: boolean };
  editorOpenFront: (frontId: string) => void;
  getFrontsConfig: () => void;
  isCurrentFrontsMenuOpen: boolean;
}

const FrontsEditContainer = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const SingleFrontContainer = styled('div')`
  height: 100%;
`;

const FeedContainer = styled(SectionContainer)`
  height: 100%;
`;

const FrontsContainer = styled(SectionContainer)<{
  makeRoomForExtraHeader: boolean;
}>`
  height: 100%;
  overflow-x: scroll;
  transition: transform 0.15s;
  ${({ makeRoomForExtraHeader }) =>
    makeRoomForExtraHeader &&
    `
    transform: translate3d(0, 60px, 0);
    height: calc(100% - 60px)`}
`;

class FrontsEdit extends React.Component<Props> {
  public componentDidMount() {
    this.props.getFrontsConfig();
  }

  public render() {
    return (
      <FrontsEditContainer>
        <ErrorBannner error={this.props.error} />
        <PressFailAlert staleFronts={this.props.staleFronts} />
        <SectionsContainer>
          <FeedContainer>
            <FeedSection />
          </FeedContainer>
          <FrontsContainer
            id={frontsContainerId}
            makeRoomForExtraHeader={this.props.isCurrentFrontsMenuOpen}
          >
            {this.props.frontIds.map(frontId => (
              <SingleFrontContainer key={frontId} id={createFrontId(frontId)}>
                <FrontContainer frontId={frontId} />
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
  frontIds: selectEditorFrontsByPriority(state, {
    priority: props.match.params.priority || ''
  }),
  isCurrentFrontsMenuOpen: selectIsCurrentFrontsMenuOpen(state)
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
