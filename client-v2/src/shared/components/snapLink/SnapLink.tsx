import React from 'react';
import { styled } from 'shared/constants/theme';
import { connect } from 'react-redux';
import upperFirst from 'lodash/upperFirst';

import CollectionItemContainer from '../collectionItem/CollectionItemContainer';
import CollectionItemMetaContainer from '../collectionItem/CollectionItemMetaContainer';
import CollectionItemMetaHeading from '../collectionItem/CollectionItemMetaHeading';
import { ThumbnailSmall } from '../Thumbnail';
import { HoverActionsButtonWrapper } from '../input/HoverActionButtonWrapper';
import { HoverDeleteButton } from '../input/HoverActionButtons';
import { HoverActionsAreaOverlay } from '../CollectionHoverItems';
import { ArticleFragment, CollectionItemSizes } from 'shared/types/Collection';
import {
  selectSharedState,
  selectArticleFragment
} from '../../selectors/shared';
import { State } from '../../types/State';
import CollectionItemHeading from '../collectionItem/CollectionItemHeading';
import CollectionItemContent from '../collectionItem/CollectionItemContent';
import CollectionItemBody from '../collectionItem/CollectionItemBody';
import CollectionItemMetaContent from '../collectionItem/CollectionItemMetaContent';

const SnapLinkBodyContainer = styled(CollectionItemBody)`
  justify-content: space-between;
  border-top-color: ${({ theme }) => theme.shared.base.colors.borderColor};
`;

interface ContainerProps {
  selectSharedState?: (state: any) => State;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete?: (uuid: string) => void;
  onClick?: () => void;
  id: string;
  draggable?: boolean;
  size?: CollectionItemSizes;
  showMeta?: boolean;
  fade?: boolean;
  children?: React.ReactNode;
  isUneditable?: boolean;
}

interface SnapLinkProps extends ContainerProps {
  articleFragment: ArticleFragment;
}

const SnapLink = ({
  id,
  fade,
  size = 'default',
  showMeta = true,
  onDelete,
  children,
  articleFragment,
  isUneditable,
  ...rest
}: SnapLinkProps) => {
  const headline =
    articleFragment.meta.headline ||
    (articleFragment.meta.customKicker
      ? `{ ${articleFragment.meta.customKicker} }`
      : 'No headline');
  return (
    <CollectionItemContainer {...rest}>
      <SnapLinkBodyContainer data-testid="snap" size={size} fade={fade}>
        {showMeta && (
          <CollectionItemMetaContainer>
            <CollectionItemMetaHeading>Snap link</CollectionItemMetaHeading>
            <CollectionItemMetaContent>
              {upperFirst(articleFragment.meta.snapType)}
            </CollectionItemMetaContent>
          </CollectionItemMetaContainer>
        )}
        <CollectionItemContent>
          <CollectionItemHeading html>{headline}</CollectionItemHeading>
        </CollectionItemContent>
        {size === 'default' && <ThumbnailSmall />}
        <HoverActionsAreaOverlay
          disabled={isUneditable}
          justify={'space-between'}
        >
          <HoverActionsButtonWrapper
            buttons={[{ text: 'Delete', component: HoverDeleteButton }]}
            buttonProps={{
              onDelete
            }}
            size={size}
            toolTipPosition={'top'}
            toolTipAlign={'right'}
          />
        </HoverActionsAreaOverlay>
      </SnapLinkBodyContainer>
      {children}
    </CollectionItemContainer>
  );
};

const mapStateToProps = (
  state: State,
  props: ContainerProps
): { articleFragment: ArticleFragment } => {
  const sharedState = props.selectSharedState
    ? props.selectSharedState(state)
    : selectSharedState(state);
  return {
    articleFragment: selectArticleFragment(sharedState, props.id)
  };
};

export default connect(mapStateToProps)(SnapLink);
