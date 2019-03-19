import React from 'react';
import startCase from 'lodash/startCase';
import { connect } from 'react-redux';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import {
  editorMoveFront,
  createSelectEditorFrontsByPriority
} from 'bundles/frontsUIBundle';
import { FrontConfig } from 'types/FaciaApi';
import { styled, theme as themeConstants } from 'constants/theme';
import { scrollToLeft } from 'util/scroll';
import { frontsContainerId, createFrontId } from 'util/editUtils';

interface ComponentProps {
  moveFront: (dropResult: DropResult) => void;
  fronts: FrontConfig[];
}

interface ContainerProps {
  priority: string;
}

const FrontTabList = styled('div')<{ isDraggingOver?: boolean }>`
  background-color: ${({ isDraggingOver, theme }) =>
    isDraggingOver
      ? theme.shared.colors.greyMedium
      : theme.shared.colors.greyMediumDark};
  position: absolute;
  height: 60px;
  line-height: 60px;
  width: calc(100vw - 120px);
  transition: background-color 0.15s;
  white-space: nowrap;
  overflow-x: scroll;
`;

const NoFronts = styled(FrontTabList)`
  padding-left: 10px;
  font-family: TS3TextSans;
  font-size: 14px;
`;

const FrontTab = styled('div')<{ isDragging: boolean }>`
  display: inline-block;
  vertical-align: top;
  height: 100%;
  line-height: 60px;
  padding: 0 22px;
  font-size: 16px;
  background-color: ${({ isDragging }) =>
    isDragging
      ? themeConstants.shared.colors.blackDark
      : themeConstants.shared.colors.greyMediumDark};
  & + & {
    box-shadow: -1px 0 0 0
      ${({ isDragging }) =>
        isDragging ? 'transparent' : themeConstants.shared.colors.greyMedium};
  }
  &:hover {
    background-color: ${themeConstants.shared.colors.greyMedium};
  }
`;

class Component extends React.Component<ComponentProps> {
  public render() {
    if (!this.props.fronts.length) {
      return <NoFronts>There are no open fronts.</NoFronts>;
    }
    return (
      <DragDropContext onDragEnd={this.props.moveFront}>
        <Droppable droppableId="front-list" direction="horizontal">
          {(dropProvided, dropSnapshot) => (
            <FrontTabList
              innerRef={dropProvided.innerRef}
              isDraggingOver={dropSnapshot.isDraggingOver}
              {...dropProvided.droppableProps}
            >
              {this.props.fronts.map((front, index) => (
                <Draggable key={front.id} draggableId={front.id} index={index}>
                  {(provided, snapshot) => (
                    <FrontTab
                      innerRef={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={provided.draggableProps.style}
                      isDragging={snapshot.isDragging}
                      key={front.id}
                      onClick={() => this.scrollToFront(front.id)}
                    >
                      {startCase(front.id)}
                    </FrontTab>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </FrontTabList>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
  private scrollToFront(frontId: string) {
    const frontElement = document.getElementById(createFrontId(frontId));
    const frontContainerElement = document.getElementById(frontsContainerId);
    if (!frontElement || !frontContainerElement) {
      return;
    }
    // We can't use scrollIntoView here, as the fronts container is
    // translated, and this results in odd behaviour. Instead, we use
    // this function to scroll imperatively.
    scrollToLeft(frontContainerElement, frontElement.offsetLeft, 300);
  }
}

const mapStateToProps = () => {
  const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
  return (state: State, { priority }: ContainerProps) => ({
    fronts: selectEditorFrontsByPriority(state, { priority })
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  moveFront: (dropResult: DropResult) =>
    dropResult.destination &&
    dispatch(
      editorMoveFront(dropResult.draggableId, dropResult.destination.index)
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
