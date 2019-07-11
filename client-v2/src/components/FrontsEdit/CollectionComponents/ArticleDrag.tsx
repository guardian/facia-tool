import React from 'react';
import { connect } from 'react-redux';
import {
  createSelectArticleFromArticleFragment,
  selectSharedState
} from 'shared/selectors/shared';
import { State } from 'types/State';
import { theme, styled } from '../../../constants/theme';

interface ContainerProps {
  id: string;
}

interface ComponentProps {
  headline?: string;
}

// These constants can be added to setDragImage to
// position the drag component in a consistent way.
export const dragOffsetX = -5;
export const dragOffsetY = 40;

const DragContainer = styled.div`
  position: relative;
  padding: 0 0 10px 10px;
`;

const DragContent = styled.div`
  background: ${theme.shared.base.colors.backgroundColorFocused};
  border-radius: 4px;
  overflow: hidden;
  padding: 8px;
  text-overflow: ellipsis;
  width: 300px;
  white-space: nowrap;
`;

export const ArticleDragComponent = ({ headline }: ComponentProps) =>
  headline ? (
    <DragContainer>
      <DragContent>{headline}</DragContent>
    </DragContainer>
  ) : null;

const createMapStateToProps = () => {
  const selectArticle = createSelectArticleFromArticleFragment();
  return (state: State, props: ContainerProps): { headline?: string } => {
    const article = selectArticle(selectSharedState(state), props.id);
    return { headline: article && article.headline };
  };
};

export default connect(createMapStateToProps)(ArticleDragComponent);
