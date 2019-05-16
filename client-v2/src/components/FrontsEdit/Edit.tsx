import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router-dom';
import { styled } from 'constants/theme';
import getFrontsConfig from 'actions/Fronts';
import {
  editorOpenFront,
  editorFavouriteFront,
  editorUnfavouriteFront,
  selectEditorFrontIdsByPriority,
  selectIsCurrentFrontsMenuOpen
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
import { frontsContainerId, createFrontId } from 'util/editUtils';
import { MoreIcon } from 'shared/components/icons/Icons';

interface Props {
  match: match<{ priority: string }>;
  error: ActionError;
  frontIds: string[];
  staleFronts: { [id: string]: boolean };
  editorOpenFront: (frontId: string, priority: string) => void;
  editorFavouriteFront: (frontId: string, priority: string) => void;
  editorUnfavouriteFront: (frontId: string, priority: string) => void;
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
  flex: 1 1 auto;
  height: 100%;
  min-width: 626px;
`;

// This is just to stop the feed / clipboard from filling the screen when no fronts
// are selected
const NoFrontContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  font-size: 24px;
  color: #aaa;
  width: 50vw;
`;

const FeedContainer = styled(SectionContainer)`
  flex: 1 2 auto;
  height: 100%;
`;

const FrontsContainer = styled(SectionContainer)<{
  makeRoomForExtraHeader: boolean;
}>`
  display: flex;
  flex: 1 1 auto;
  height: 100%;
  overflow-y: hidden;
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
            {this.props.frontIds.length ? (
              this.props.frontIds.map(id => (
                <SingleFrontContainer key={id} id={createFrontId(id)}>
                  <FrontContainer frontId={id} />
                </SingleFrontContainer>
              ))
            ) : (
              <NoFrontContainer>
                <span>
                  Select a front with the{' '}
                  <MoreIcon verticalAlign="bottom" fill="#aaa" size={'xxl'} />{' '}
                  button
                </span>
              </NoFrontContainer>
            )}
          </FrontsContainer>
        </SectionsContainer>
        <FrontsMenu
          onSelectFront={id =>
            this.props.editorOpenFront(id, this.props.match.params.priority)
          }
          onFavouriteFront={id =>
            this.props.editorFavouriteFront(
              id,
              this.props.match.params.priority
            )
          }
          onUnfavouriteFront={id =>
            this.props.editorUnfavouriteFront(
              id,
              this.props.match.params.priority
            )
          }
        />
      </FrontsEditContainer>
    );
  }
}

const mapStateToProps = (state: State, props: Props) => ({
  error: state.error,
  staleFronts: state.staleFronts,
  frontIds: selectEditorFrontIdsByPriority(
    state,
    props.match.params.priority || ''
  ),
  isCurrentFrontsMenuOpen: selectIsCurrentFrontsMenuOpen(state)
});

const mapDispatchToProps = (dispatch: Dispatch, props: Props) => ({
  editorOpenFront: (id: string) => {
    dispatch(editorOpenFront(id, props.match.params.priority));
  },
  editorFavouriteFront: (id: string) =>
    dispatch(editorFavouriteFront(id, props.match.params.priority)),
  editorUnfavouriteFront: (id: string) =>
    dispatch(editorUnfavouriteFront(id, props.match.params.priority)),
  getFrontsConfig: () => dispatch(getFrontsConfig())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontsEdit);
