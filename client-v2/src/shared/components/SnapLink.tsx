import React from 'react';

import CollectionItemBody from './CollectionItemBody';
import CollectionItemContainer from './CollectionItemContainer';
import CollectionItemMetaContainer from './CollectionItemMetaContainer';
import CollectionItemMetaHeading from './CollectionItemMetaHeading';
import Thumbnail from './Thumbnail';
import HoverActions, {
  HoverActionsLeft,
  HoverActionsRight
} from './CollectionHoverItems';
import { ArticleFragment } from 'shared/types/Collection';
import {
  selectSharedState,
  articleFragmentSelector
} from '../selectors/shared';
import { State } from '../types/State';
import { connect } from 'react-redux';
import CollectionItemHeading from './CollectionItemHeading';
import CollectionItemContent from './CollectionItemContent';
import ButtonHoverAction from './input/ButtonHoverAction';

interface SnapLinkProps {
  id: string;
  draggable?: boolean;
  size?: 'default' | 'small';
  fade?: boolean;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete?: (uuid: string) => void;
  onClick?: () => void;
}

interface ContainerProps extends SnapLinkProps {
  selectSharedState?: (state: any) => State;
}

const SnapLink = ({ id, fade, onClick, size = 'default', onDelete, ...rest }: SnapLinkProps) => (
  <CollectionItemContainer {...rest}>
    <CollectionItemBody size={size} fade={fade}>
      <CollectionItemMetaContainer>
        <CollectionItemMetaHeading>Snap link</CollectionItemMetaHeading>
      </CollectionItemMetaContainer>
      <CollectionItemContent>
        <CollectionItemHeading>To be implemented. (Drag and drop as usual.)</CollectionItemHeading>
      </CollectionItemContent>
      {size === 'default' && <Thumbnail />}
      <HoverActions>
        <HoverActionsLeft />
        <HoverActionsRight>
          <ButtonHoverAction
            action="delete"
            danger
            onClick={(e: React.SyntheticEvent) => {
              e.stopPropagation();
              if (onDelete) {
                onDelete(id);
              }
            }}
            title="Delete"
          />
        </HoverActionsRight>
      </HoverActions>
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
