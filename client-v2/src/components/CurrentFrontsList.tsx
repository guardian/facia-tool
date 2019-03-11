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
  createSelectEditorFronts,
  editorMoveFront
} from 'bundles/frontsUIBundle';
import { FrontConfig } from 'types/FaciaApi';
import { styled, theme as themeConstants } from 'constants/theme';

interface ComponentProps {
  fronts: FrontConfig[];
  moveFront: (dropResult: DropResult) => void;
}

const FrontTabList = styled('div')<{ isDraggingOver: boolean }>`
  background-color: ${({ isDraggingOver, theme }) =>
    isDraggingOver ? theme.shared.colors.greyDark : theme.shared.colors.blackLight};
  position: absolute;
  height: 60px;
  min-width: 100%;
  transition: background-color 0.15s;
  white-space: nowrap;
  overflow: hidden;
`;

const FrontTab = styled('div')<{ isDragging: boolean }>`
  display: inline-block;
  vertical-align: top;
  height: 100%;
  padding: 0 10px;
  font-size: 16px;
  background-color: ${({ isDragging }) =>
    isDragging
      ? themeConstants.shared.colors.greyLight
      : themeConstants.shared.colors.greyDark};
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
                    >
                      {startCase(front.id)}
                    </FrontTab>
                  )}
                </Draggable>
              ))}
            </FrontTabList>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

const mapStateToProps = () => {
  const selectEditorFronts = createSelectEditorFronts();
  return (state: State) => ({
    fronts: selectEditorFronts(state)
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  moveFront: (dropResult: DropResult) =>
    dropResult.destination &&
    dispatch(
      editorMoveFront(
        dropResult.draggableId,
        dropResult.source.index,
        dropResult.destination.index
      )
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
