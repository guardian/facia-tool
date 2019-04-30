import React from 'react';
import { styled } from 'shared/constants/theme';
import { connect } from 'react-redux';
import { Dispatch } from 'types/Store';
import { State } from 'types/State';
import {
  selectSharedState,
  selectCollectionItemHasMediaOverrides
} from 'shared/selectors/shared';
import imageDragIcon from 'images/icons/image-drag-icon.svg';
import { theme } from 'constants/theme';
import { copyArticleFragmentImageMetaWithPersist } from 'actions/ArticleFragments';

interface ContainerProps {
  id: string;
}

interface ComponentProps extends ContainerProps {
  copyCollectionItemImageMeta: (from: string, to: string) => void;
  canDrag: boolean;
}

const DragIntentIndicator = styled.div`
  display: none;
  position: absolute;
  height: 10px;
  bottom: 0;
  width: 100%;
  background-color: ${theme.shared.colors.orange};
`;
const DragIntentContainer = styled.div<{
  isDraggingOver: boolean;
  isDragging: boolean;
  canDrag: boolean;
}>`
  position: relative;
  ${DragIntentIndicator} {
    ${({ isDraggingOver }) => isDraggingOver && `display: block;`}
  }
  ${({ canDrag }) =>
    canDrag &&
    `&:hover {
    opacity: 0.6;
  }`};
  ${({ isDragging }) => isDragging && `opacity: 0.6;`};
`;

interface ComponentState {
  isDraggingOver: boolean;
  isDragging: boolean;
}

export const DRAG_COLLECTION_ITEM_IMAGE = '@@drag_collection_item_image@@';

const dragImage = new Image();
dragImage.src = imageDragIcon;

const initialState = {
  isDraggingOver: false,
  isDragging: false
};

class DraggableArticleImageContainer extends React.Component<
  ComponentProps,
  ComponentState
> {
  public state = initialState;

  constructor(props: ComponentProps) {
    super(props);
  }
  public render() {
    const { children } = this.props;
    return (
      <DragIntentContainer
        draggable={this.props.canDrag}
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        isDraggingOver={this.state.isDraggingOver}
        canDrag={this.props.canDrag}
        isDragging={this.state.isDragging}
        title="Drag this media to add it to other articles"
      >
        {children}
        <DragIntentIndicator />
      </DragIntentContainer>
    );
  }

  private handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.setData(DRAG_COLLECTION_ITEM_IMAGE, this.props.id);
    e.dataTransfer.setDragImage(dragImage, -25, 50);
    this.setState({ isDragging: true });
  };

  private handleDragEnd = () => this.setState({ isDragging: false });

  private handleDragEnter = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

  private handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (
      e.dataTransfer.types.includes(DRAG_COLLECTION_ITEM_IMAGE) &&
      !this.state.isDragging
    ) {
      this.setState({ isDraggingOver: true });
    }
  };

  private handleDragLeave = () => {
    if (this.state.isDraggingOver) {
      this.setState({ isDraggingOver: false });
    }
  };

  private handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (this.state.isDragging) {
      return;
    }
    const articleUuid = e.dataTransfer.getData(DRAG_COLLECTION_ITEM_IMAGE);
    if (!articleUuid) {
      return;
    }
    this.props.copyCollectionItemImageMeta(articleUuid, this.props.id);
    this.resetDragState();
  };

  private resetDragState = () => this.setState(initialState);
}

const mapStateToProps = (state: State, { id }: ContainerProps) => ({
  canDrag: selectCollectionItemHasMediaOverrides(selectSharedState(state), id)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  copyCollectionItemImageMeta: (from: string, to: string) =>
    dispatch(copyArticleFragmentImageMetaWithPersist(from, to))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DraggableArticleImageContainer);
