import React from 'react';
import { Level, LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import type { State } from 'types/State';
import { connect } from 'react-redux';
import { Card } from 'types/Collection';
import ArticleDrag, {
  dragOffsetX,
  dragOffsetY,
} from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import DropZone, {
  DefaultDropContainer,
  DefaultDropIndicator,
} from 'components/DropZone';
import { createSelectSupportingArticles } from 'selectors/shared';
import { collectionDropTypeBlacklist } from 'constants/fronts';
import { theme, styled } from 'constants/theme';

interface OuterProps {
  cardId: string;
  children: LevelChild<Card>;
  onMove: MoveHandler<Card>;
  onDrop: DropHandler;
  isUneditable?: boolean;
}

interface InnerProps {
  supporting: Card[];
}

type Props = OuterProps & InnerProps;

const CardDropContainer = styled(DefaultDropContainer)`
  margin-top: -30px;
  margin-left: 80px;
  height: 30px;
`;

const CardDropIndicator = styled(DefaultDropIndicator)`
  position: absolute;
  width: 100%;
  bottom: 0px;
`;

const CardLevel = ({
  children,
  cardId,
  supporting,
  onMove,
  onDrop,
  isUneditable,
}: Props) => (
  <Level
    arr={supporting || []}
    blacklistedDataTransferTypes={collectionDropTypeBlacklist}
    parentType="card"
    parentId={cardId}
    type="card"
    getId={({ uuid }) => uuid}
    onMove={onMove}
    onDrop={onDrop}
    canDrop={!isUneditable}
    renderDrag={(af) => <ArticleDrag id={af.uuid} />}
    dragImageOffsetX={dragOffsetX}
    dragImageOffsetY={dragOffsetY}
    renderDrop={
      isUneditable
        ? undefined
        : (props) => (
            <DropZone
              {...props}
              dropColor={theme.base.colors.dropZoneActiveSublink}
              dropMessage={'Sublink'}
              dropContainer={CardDropContainer}
              dropIndicator={CardDropIndicator}
            />
          )
    }
  >
    {children}
  </Level>
);

const createMapStateToProps = () => {
  const selectSupportingArticles = createSelectSupportingArticles();
  return (state: State, { cardId }: OuterProps) => ({
    supporting: selectSupportingArticles(state, { cardId }),
  });
};

export default connect(createMapStateToProps)(CardLevel);
