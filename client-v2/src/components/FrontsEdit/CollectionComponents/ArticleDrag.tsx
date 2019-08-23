import React from 'react';
import { connect } from 'react-redux';
import {
  createSelectArticleFromArticleFragment,
  selectSharedState
} from 'shared/selectors/shared';
import { State } from 'types/State';
import { theme, styled } from '../../../constants/theme';
import documentDragIcon from 'images/icons/document-drag-icon.svg';

interface ContainerProps {
  id: string;
}

interface ComponentProps {
  headline?: string;
}

// These constants can be added to setDragImage to
// position the drag component in a consistent way.
export const dragOffsetX = -5;
export const dragOffsetY = 50;

const DragContainer = styled.div`
  position: relative;
  padding: 0 0 10px 10px;
  display: flex;
  flex-direction: column;
  width: 330px;
`;

const DragContent = styled.div`
  background: ${theme.shared.colors.yellow};
  border-radius: 4px;
  overflow: hidden;
  padding: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  font-size: 12px;
  font: TS3TextSans;
  flex: 4;
  align-self: flex-end;
  width: 300px;
`;

const DragContentIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: ${theme.shared.colors.yellow};
  flex: 1;
  align-self: flex-start;
  padding: 6px 8px;
  margin-top: -15px;
  box-shadow: 1px -1px 20px black;
`;

export const DraggingArticleComponent = ({ headline }: ComponentProps) =>
  headline ? (
    <DragContainer>
      <DragContent>{headline}</DragContent>
      <DragContentIcon>
        <img src={documentDragIcon} />
      </DragContentIcon>
    </DragContainer>
  ) : null;

const createMapStateToProps = () => {
  const selectArticle = createSelectArticleFromArticleFragment();
  return (state: State, props: ContainerProps): { headline?: string } => {
    const article = selectArticle(selectSharedState(state), props.id);
    return { headline: article && article.headline };
  };
};

export default connect(createMapStateToProps)(DraggingArticleComponent);
