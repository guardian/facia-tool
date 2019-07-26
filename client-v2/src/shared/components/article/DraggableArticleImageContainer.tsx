import React from 'react';
import { styled } from 'shared/constants/theme';
import { connect } from 'react-redux';
import { State } from 'types/State';
import {
  selectSharedState,
  selectCollectionItemHasMediaOverrides
} from 'shared/selectors/shared';
import imageDragIcon from 'images/icons/image-drag-icon.svg';
import {
  DRAG_DATA_COLLECTION_ITEM_IMAGE_OVERRIDE,
  DRAG_DATA_GRID_IMAGE_URL
} from 'constants/image';
import { createSelectActiveImageUrl } from 'shared/selectors/collectionItem';

interface ContainerProps {
  id: string;
  canDrag?: boolean;
}

interface ComponentProps extends ContainerProps {
  canDrag: boolean;
  activeImageUrl: string | undefined;
  hasImageOverrides: boolean;
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
    if (this.props.hasImageOverrides) {
      e.dataTransfer.setData(
        DRAG_DATA_COLLECTION_ITEM_IMAGE_OVERRIDE,
        this.props.id
      );
    }
    if (this.props.activeImageUrl) {
      e.dataTransfer.setData(
        DRAG_DATA_GRID_IMAGE_URL,
        this.props.activeImageUrl
      );
    }
    e.dataTransfer.setDragImage(dragImage, -25, 50);
    this.setState({ isDragging: true });
  };
}

const mapStateToProps = () => {
  const selectActiveImageUrl = createSelectActiveImageUrl();
  return (state: State, { id, canDrag = true }: ContainerProps) => {
    const activeImageUrl = selectActiveImageUrl(selectSharedState(state), id);
    return {
      activeImageUrl,
      canDrag: !!activeImageUrl && canDrag,
      hasImageOverrides: selectCollectionItemHasMediaOverrides(
        selectSharedState(state),
        id
      )
    };
  };
};

export default connect(mapStateToProps)(DraggableArticleImageContainer);
