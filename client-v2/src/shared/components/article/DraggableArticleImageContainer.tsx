import React from 'react';
import { styled } from 'shared/constants/theme';
import { connect } from 'react-redux';
import { State } from 'types/State';
import {
  selectSharedState,
  selectCollectionItemHasMediaOverrides
} from 'shared/selectors/shared';
import imageDragIcon from 'images/icons/image-drag-icon.svg';
import { DRAG_COLLECTION_ITEM_IMAGE } from 'constants/image';

interface ContainerProps {
  id: string;
}

interface ComponentProps extends ContainerProps {
  canDrag: boolean;
}

const DragIntentContainer = styled.div<{
  canDrag: boolean;
}>`
  position: relative;
  ${({ canDrag }) =>
    canDrag &&
    `&:hover {
    opacity: 0.6;
  }`};
`;

const dragImage = new Image();
dragImage.src = imageDragIcon;

class DraggableArticleImageContainer extends React.Component<ComponentProps> {
  constructor(props: ComponentProps) {
    super(props);
  }
  public render() {
    const { children } = this.props;
    return (
      <DragIntentContainer
        draggable={this.props.canDrag}
        onDragStart={this.handleDragStart}
        canDrag={this.props.canDrag}
        title="Drag this media to add it to other articles"
      >
        {children}
      </DragIntentContainer>
    );
  }

  private handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.setData(DRAG_COLLECTION_ITEM_IMAGE, this.props.id);
    e.dataTransfer.setDragImage(dragImage, -25, 50);
    this.setState({ isDragging: true });
  };
}

const mapStateToProps = (state: State, { id }: ContainerProps) => ({
  canDrag: selectCollectionItemHasMediaOverrides(selectSharedState(state), id)
});

export default connect(mapStateToProps)(DraggableArticleImageContainer);
