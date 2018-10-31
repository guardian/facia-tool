import React from 'react';
import { connect } from 'react-redux';

import CollectionItemContainer from '../collectionItem/CollectionItemContainer';
import CollectionItemMetaContainer from '../collectionItem/CollectionItemMetaContainer';
import CollectionItemMetaHeading from '../collectionItem/CollectionItemMetaHeading';
import Thumbnail from '../Thumbnail';
import { HoverActionsButtonWrapper } from '../input/HoverActionButtonWrapper';
import { HoverDeleteButton } from '../input/HoverActionButtons';
import {
  HoverActionsAreaOverlay,
  HideMetaDataOnToolTipDisplay
} from '../CollectionHoverItems';
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

interface SnapLinkProps {
  id: string;
  draggable?: boolean;
  size?: CollectionItemSizes;
  displayType?: CollectionItemDisplayTypes;
  fade?: boolean;
  children?: React.ReactNode;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete?: (uuid: string) => void;
  onClick?: () => void;
}

interface ContainerProps extends SnapLinkProps {
  selectSharedState?: (state: any) => State;
}

const snapLinkPlaceholder = ' Placeholder (Drag and drop as usual.)';

const SnapLink = ({
  id,
  fade,
  onClick,
  size = 'default',
  displayType = 'default',
  onDelete,
  children,
  ...rest
}: SnapLinkProps) => (
  <CollectionItemContainer {...rest}>
    <CollectionItemBody size={size} fade={fade} displayType={displayType}>
      {displayType === 'default' && (
        <CollectionItemMetaContainer>
          <CollectionItemMetaHeading>Snap link</CollectionItemMetaHeading>
        </CollectionItemMetaContainer>
      )}
      {size === 'default' &&
        displayType === 'polaroid' && <PolaroidThumbnail />}
      <CollectionItemContent displayType={displayType}>
        {displayType === 'default' ? (
          <CollectionItemHeading>{snapLinkPlaceholder}</CollectionItemHeading>
        ) : (
          <>
            <strong>Snap link</strong>
            {snapLinkPlaceholder}
          </>
        )}
      </CollectionItemContent>
      {size === 'default' && displayType === 'default' && <Thumbnail />}
      <HoverActionsAreaOverlay justify={displayType === 'polaroid' ? 'flex-end' : 'space-between'}>
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
