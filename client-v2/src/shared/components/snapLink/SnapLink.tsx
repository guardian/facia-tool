import React from 'react';
import { connect } from 'react-redux';

import CollectionItemContainer from '../collectionItem/CollectionItemContainer';
import CollectionItemMetaContainer from '../collectionItem/CollectionItemMetaContainer';
import CollectionItemMetaHeading from '../collectionItem/CollectionItemMetaHeading';
import Thumbnail from '../Thumbnail';
import HoverActions, {
  HoverActionsLeft,
  HoverActionsRight
} from '../CollectionHoverItems';
import { ArticleFragment } from 'shared/types/Collection';
import {
  selectSharedState,
  articleFragmentSelector
} from '../../selectors/shared';
import { State } from '../../types/State';
import CollectionItemHeading from '../collectionItem/CollectionItemHeading';
import CollectionItemContent from '../collectionItem/CollectionItemContent';
import ButtonHoverAction from '../input/ButtonHoverAction';
import CollectionItemBody from '../collectionItem/CollectionItemBody';

interface SnapLinkProps {
  id: string;
  draggable?: boolean;
  size?: 'default' | 'small';
  displayType?: 'default' | 'polaroid';
  fade?: boolean;
  children: React.ReactNode;
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
  size = 'default',
  displayType,
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
      {displayType === 'default' ? (
        <CollectionItemContent>
          <CollectionItemHeading>
            Snaplink placeholder (Drag and drop as usual.)
          </CollectionItemHeading>
        </CollectionItemContent>
      ) : (
        'Snaplink placeholder (Drag and drop as usual.)'
      )}
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
