import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import {
  editorOpenFront,
  editorFavouriteFront,
  editorUnfavouriteFront,
  selectEditorFrontIdsByPriority,
  selectIsCurrentFrontsMenuOpen,
  selectIsClipboardOpen
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
import { frontsContainerId } from 'util/editUtils';
import { PriorityName } from 'types/Priority';

export interface EditProps {
  priority: PriorityName;
  error: ActionError;
  frontIds: string[];
  staleFronts: { [id: string]: boolean };
  editorOpenFront: (frontId: string, priority: string) => void;
  editorFavouriteFront: (frontId: string, priority: string) => void;
  editorUnfavouriteFront: (frontId: string, priority: string) => void;
  getFrontsConfig: () => void;
  isCurrentFrontsMenuOpen: boolean;
  isClipboardOpen: boolean;
}

const FrontsEditContainer = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const FeedContainer = styled(SectionContainer)`
  height: 100%;
`;

const FrontsContainer = styled(SectionContainer)<{
  makeRoomForExtraHeader: boolean;
}>`
  display: flex;
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

class FrontsEdit extends React.Component<EditProps> {
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
            <FeedSection isClipboardOpen={this.props.isClipboardOpen} />
          </FeedContainer>
          <FrontsContainer
            id={frontsContainerId}
            makeRoomForExtraHeader={this.props.isCurrentFrontsMenuOpen}
          >
            {this.props.frontIds.map(id => (
              <FrontContainer key={id} frontId={id} />
            ))}
          </FrontsContainer>
        </SectionsContainer>
        <FrontsMenu
          onSelectFront={id =>
            this.props.editorOpenFront(id, this.props.priority)
          }
          onFavouriteFront={id =>
            this.props.editorFavouriteFront(id, this.props.priority)
          }
          onUnfavouriteFront={id =>
            this.props.editorUnfavouriteFront(id, this.props.priority)
          }
        />
      </FrontsEditContainer>
    );
  }
}

const mapStateToProps = (state: State, props: EditProps) => ({
  error: state.error,
  staleFronts: state.staleFronts,
  frontIds: selectEditorFrontIdsByPriority(state, props.priority || ''),
  isCurrentFrontsMenuOpen: selectIsCurrentFrontsMenuOpen(state),
  isClipboardOpen: selectIsClipboardOpen(state)
});

const mapDispatchToProps = (dispatch: Dispatch, props: EditProps) => ({
  editorOpenFront: (id: string) => {
    dispatch(editorOpenFront(id, props.priority));
  },
  editorFavouriteFront: (id: string) =>
    dispatch(editorFavouriteFront(id, props.priority)),
  editorUnfavouriteFront: (id: string) =>
    dispatch(editorUnfavouriteFront(id, props.priority))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontsEdit);
