import React from 'react';
import { connect } from 'react-redux';
import upperFirst from 'lodash/upperFirst';

import CollectionItemContainer from '../collectionItem/CollectionItemContainer';
import CollectionItemMetaContainer from '../collectionItem/CollectionItemMetaContainer';
import CollectionItemMetaHeading from '../collectionItem/CollectionItemMetaHeading';
import Thumbnail from '../Thumbnail';
import { HoverActionsButtonWrapper } from '../input/HoverActionButtonWrapper';
import { HoverDeleteButton } from '../input/HoverActionButtons';
import { HoverActionsAreaOverlay } from '../CollectionHoverItems';
import { ArticleFragment, CollectionItemSizes } from 'shared/types/Collection';
import {
  selectSharedState,
  articleFragmentSelector
} from '../../selectors/shared';
import { State } from '../../types/State';
import CollectionItemHeading from '../collectionItem/CollectionItemHeading';
import CollectionItemContent from '../collectionItem/CollectionItemContent';
import CollectionItemBody from '../collectionItem/CollectionItemBody';
import PolaroidThumbnail from '../PolaroidThumbnail';
import { CollectionItemDisplayTypes } from 'shared/types/Collection';
import CollectionItemTrail from '../collectionItem/CollectionItemTrail';
import CollectionItemMetaContent from '../collectionItem/CollectionItemMetaContent';
import CollectionItemNotification from '../collectionItem/CollectionItemNotification';

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
  displayType?: CollectionItemDisplayTypes;
  fade?: boolean;
  children?: React.ReactNode;
  notifications?: string[];
  isUneditable?: boolean;
}

interface SnapLinkProps extends ContainerProps {
  articleFragment: ArticleFragment;
}

const SnapLink = ({
  id,
  fade,
  size = 'default',
  displayType = 'default',
  onDelete,
  children,
  articleFragment,
  notifications,
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
      <CollectionItemBody
        size={size}
        fade={fade}
        displayType={displayType}
        style={{
          borderTopColor: '#c9c9c9'
        }}
      >
        {displayType === 'default' && (
          <CollectionItemMetaContainer>
            <CollectionItemMetaHeading>Snap link</CollectionItemMetaHeading>
            <CollectionItemMetaContent>
              {upperFirst(articleFragment.meta.snapType)}
            </CollectionItemMetaContent>
          </CollectionItemMetaContainer>
        )}
        {size === 'default' &&
          displayType === 'polaroid' && <PolaroidThumbnail />}
        <CollectionItemContent displayType={displayType}>
          {displayType === 'default' ? (
            <CollectionItemHeading>{headline}</CollectionItemHeading>
          ) : (
            <>
              <strong>Snap link </strong>
              {headline}
            </>
          )}
          {size === 'default' &&
            articleFragment.meta.trailText && (
              <CollectionItemTrail>
                {articleFragment.meta.trailText}
              </CollectionItemTrail>
            )}
        </CollectionItemContent>
        {size === 'default' && displayType === 'default' && <Thumbnail />}
        {notifications && (
          <CollectionItemNotification>
            {notifications.map(notification => (
              <span key={notification}>{notification} </span>
            ))}
          </CollectionItemNotification>
        )}
        <HoverActionsAreaOverlay
          disabled={isUneditable}
          justify={displayType === 'polaroid' ? 'flex-end' : 'space-between'}
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
      </CollectionItemBody>
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
    articleFragment: articleFragmentSelector(sharedState, props.id)
  };
};

export default connect(mapStateToProps)(SnapLink);
