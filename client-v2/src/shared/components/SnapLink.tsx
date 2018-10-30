import React from 'react';

import CollectionItemBody from './CollectionItemBody';
import CollectionItemContainer from './CollectionItemContainer';
import CollectionItemMetaContainer from './CollectionItemMetaContainer';
import CollectionItemMetaHeading from './CollectionItemMetaHeading';
import Thumbnail from './Thumbnail';
import { ArticleFragment } from 'shared/types/Collection';
import {
  selectSharedState,
  articleFragmentSelector
} from '../selectors/shared';
import { State } from '../types/State';
import { connect } from 'react-redux';
import { HoverActionsButtonWrapper } from './input/HoverActionButtonWrapper';
import { HoverDeleteButton } from './input/HoverActionButtons';
import {
  HoverActionsAreaOverlay,
  HideMetaDataOnToolTipDisplay
} from './CollectionHoverItems';
import CollectionItemHeading from './CollectionItemHeading';
import CollectionItemContent from './CollectionItemContent';

interface SnapLinkProps {
  id: string;
  draggable?: boolean;
  size?: 'default' | 'small';
  fade?: boolean;
  isSnapLink: boolean;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete?: (uuid: string) => void;
  onClick?: () => void;
}

interface ContainerProps extends SnapLinkProps {
  selectSharedState?: (state: any) => State;
}

const SnapLink = ({
  id,
  fade,
  onClick,
  isSnapLink,
  size = 'default',
  onDelete,
  ...rest
}: SnapLinkProps) => (
  <CollectionItemContainer {...rest}>
    <CollectionItemBody size={size} fade={fade}>
      <CollectionItemMetaContainer>
        <CollectionItemMetaHeading>Snap link</CollectionItemMetaHeading>
      </CollectionItemMetaContainer>
      <CollectionItemContent>
        <CollectionItemHeading>
          To be implemented. (Drag and drop as usual.)
        </CollectionItemHeading>
      </CollectionItemContent>
      {size === 'default' && <Thumbnail />}
      <HoverActionsAreaOverlay isSnapLink>
        <HoverActionsButtonWrapper
          buttons={[{ text: 'Delete', component: HoverDeleteButton }]}
          buttonProps={{
            onDelete
          }}
          size={size}
          toolTipPosition={'top'}
          toolTipAlign={'right'}
        />
        <HideMetaDataOnToolTipDisplay size={size} />
      </HoverActionsAreaOverlay>
    </CollectionItemBody>
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
