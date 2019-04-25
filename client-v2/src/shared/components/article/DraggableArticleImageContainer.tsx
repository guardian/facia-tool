import React from 'react';
import { styled } from 'shared/constants/theme';
import { connect } from 'react-redux';
import { Dispatch } from 'types/Store';
import { copyArticleFragmentImageMeta } from 'shared/actions/ArticleFragments';
import { State } from 'types/State';
import {
  selectSharedState,
  selectCollectionItemHasMediaOverrides
} from 'shared/selectors/shared';
import imageDragIcon from 'images/icons/image-drag-icon.png';

interface ContainerProps {
  id: string;
}

interface ComponentProps extends ContainerProps {
  copyCollectionItemImageMeta: (from: string, to: string) => void;
}

const DragIntentContainer = styled.div<{ isDraggingOver: boolean }>`
  ${({ isDraggingOver }) => isDraggingOver && 'box-shadow: 0 0 1px 2px orange'}
`;

interface ComponentState {
  isDraggingOver: boolean;
}

export const DRAG_COLLECTION_ITEM_IMAGE = '@@drag_collection_item_image@@';

class DraggableArticleImageContainer extends React.Component<
  ComponentProps,
  ComponentState
> {
  public state = {
    isDraggingOver: false
  };
  public render() {
    const { children } = this.props;
    return (
      <DragIntentContainer
        draggable
        onDragStart={this.handleDragStart}
        onDragEnter={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        isDraggingOver={this.state.isDraggingOver}
        title="Drag this media to add it to other articles"
      >
        {children}
      </DragIntentContainer>
    );
  }

  private handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.setData(DRAG_COLLECTION_ITEM_IMAGE, this.props.id);
    const img = document.createElement('img');
    img.src = imageDragIcon;
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  private handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes(DRAG_COLLECTION_ITEM_IMAGE)) {
      this.setState({ isDraggingOver: true });
    }
  };

  private handleDragLeave = () => {
    if (this.state.isDraggingOver) {
      this.setState({ isDraggingOver: false });
    }
  };

  private handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const articleUuid = e.dataTransfer.getData(DRAG_COLLECTION_ITEM_IMAGE);
    if (!articleUuid) {
      return;
    }
    this.setState({ isDraggingOver: false });
    this.props.copyCollectionItemImageMeta(articleUuid, this.props.id);
  };
}

const mapStateToProps = (state: State, { id }: ContainerProps) => ({
  canDrag: selectCollectionItemHasMediaOverrides(selectSharedState(state), id)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  copyCollectionItemImageMeta: (from: string, to: string) =>
    dispatch(copyArticleFragmentImageMeta(from, to))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DraggableArticleImageContainer);
