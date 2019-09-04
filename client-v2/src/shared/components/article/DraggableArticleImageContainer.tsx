import React from 'react';
import { styled } from 'shared/constants/theme';
import { connect } from 'react-redux';
import { State } from 'types/State';
import {
  selectSharedState,
  selectCollectionItemHasMediaOverrides,
  createSelectArticleFromArticleFragment
} from 'shared/selectors/shared';
import {
  DRAG_DATA_COLLECTION_ITEM_IMAGE_OVERRIDE,
  DRAG_DATA_GRID_IMAGE_URL
} from 'constants/image';
import { theme } from 'constants/theme';

interface ContainerProps {
  id: string;
  canDrag?: boolean;
}

interface ComponentProps extends ContainerProps {
  canDrag: boolean;
  currentImageUrl: string | undefined;
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

// The visual representation of an image as it is being dragged.
// This needs to be rendered by the DOM before it can be used by the Drag&Drop API, so we pushed it off to the side.
const DraggingImageContainer = styled.div`
  position: absolute;
  transform: translateX(-9999px);
`;

class DraggableArticleImageContainer extends React.Component<ComponentProps> {
  private dragNode: React.RefObject<HTMLDivElement>;
  constructor(props: ComponentProps) {
    super(props);
    this.dragNode = React.createRef();
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
        <DraggingImageContainer ref={this.dragNode}>
          <img
            width={theme.shared.thumbnailImage.width}
            height={theme.shared.thumbnailImage.height}
            src={this.props.currentImageUrl}
          />
        </DraggingImageContainer>
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
    if (this.props.currentImageUrl) {
      e.dataTransfer.setData(
        DRAG_DATA_GRID_IMAGE_URL,
        this.props.currentImageUrl
      );
    }
    if (this.dragNode.current) {
      e.dataTransfer.setDragImage(this.dragNode.current, -25, 50);
    }

    this.setState({ isDragging: true });
  };
}

const mapStateToProps = () => {
  const selectArticle = createSelectArticleFromArticleFragment();

  return (state: State, { id, canDrag = true }: ContainerProps) => {
    const article = selectArticle(selectSharedState(state), id);

    return {
      currentImageUrl: article && article.thumbnail,
      canDrag: article ? !!article.thumbnail && canDrag : false,
      hasImageOverrides: selectCollectionItemHasMediaOverrides(
        selectSharedState(state),
        id
      )
    };
  };
};

export default connect(mapStateToProps)(DraggableArticleImageContainer);
