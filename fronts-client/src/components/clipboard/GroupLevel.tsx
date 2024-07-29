import React from 'react';
import { Level, LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import type { State } from 'types/State';
import { connect } from 'react-redux';
import { Card } from 'types/Collection';
import ArticleDrag, {
  dragOffsetX,
  dragOffsetY,
} from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import DropZone, { DefaultDropContainer } from 'components/DropZone';
import { collectionDropTypeDenylist } from 'constants/fronts';
import { createSelectArticlesFromIds } from 'selectors/shared';
import { theme, styled } from 'constants/theme';

interface OuterProps {
  groupId: string;
  cardIds: string[];
  children: LevelChild<Card>;
  onMove: MoveHandler<Card>;
  onDrop: DropHandler;
  isUneditable?: boolean;
}

interface InnerProps {
  cards: Card[];
}

type Props = OuterProps & InnerProps;

const Spacer = styled.div`
  margin-top: 10px;
`;

export const CollectionDropContainer = styled(DefaultDropContainer)`
  margin: 0 -10px;
`;

const OffsetDropContainerTop = styled(CollectionDropContainer)`
  height: 32px;
  margin-top: -22px;
  padding-top: 24px;
`;

const OffsetDropContainerBottom = styled(CollectionDropContainer)`
  height: 32px;
  margin-bottom: -28px;
  padding-bottom: 24px;
`;

const getDropContainer = (itemIndex: number, numItems: number) => {
  if (itemIndex === 0) {
    return OffsetDropContainerTop;
  } else if (itemIndex === numItems) {
    return OffsetDropContainerBottom;
  } else {
    return CollectionDropContainer;
  }
};

const GroupLevel = ({
  children,
  groupId,
  cards,
  onMove,
  onDrop,
  isUneditable,
}: Props) => (
  <Level
    arr={cards}
    denylistedDataTransferTypes={collectionDropTypeDenylist}
    parentType="group"
    parentId={groupId}
    type="card"
    dragImageOffsetX={dragOffsetX}
    dragImageOffsetY={dragOffsetY}
    getId={({ uuid }) => uuid}
    onMove={onMove}
    onDrop={onDrop}
    canDrop={!isUneditable}
    renderDrag={(af) => <ArticleDrag id={af.uuid} />}
    renderDrop={
      isUneditable
        ? () => <Spacer />
        : (props) => (
            <DropZone
              {...props}
              dropColor={theme.base.colors.dropZoneActiveStory}
              doubleHeight={!cards.length || props.index === 0}
              dropContainer={getDropContainer(props.index, cards.length)}
            />
          )
    }
  >
    {children}
  </Level>
);

const createMapStateToProps = () => {
  const selectArticlesFromIds = createSelectArticlesFromIds();
  return (state: State, { cardIds }: OuterProps) => ({
    cards: selectArticlesFromIds(state, {
      cardIds,
    }),
  });
};

export default connect(createMapStateToProps)(GroupLevel);
