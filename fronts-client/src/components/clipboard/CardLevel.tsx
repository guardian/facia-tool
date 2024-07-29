import React from 'react';
import { LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
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
import { theme, styled } from 'constants/theme';
import { CardTypeLevel } from 'lib/dnd/CardTypeLevel';
import { CardTypes } from 'constants/cardTypes';

interface OuterProps {
  cardId: string;
  children: LevelChild<Card>;
  onMove: MoveHandler<Card>;
  onDrop: DropHandler;
  isUneditable?: boolean;
  dropMessage?: string;
  cardTypeAllowList?: CardTypes[];
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
  dropMessage,
  cardTypeAllowList,
}: Props) => (
  <CardTypeLevel
    arr={supporting || []}
    parentType="card"
    parentId={cardId}
    type="card"
    getId={({ uuid }) => uuid}
    onMove={onMove}
    onDrop={onDrop}
    canDrop={!isUneditable}
    cardTypeAllowList={cardTypeAllowList}
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
              dropMessage={dropMessage ?? 'Sublink'}
              dropContainer={CardDropContainer}
              dropIndicator={CardDropIndicator}
            />
          )
    }
  >
    {children}
  </CardTypeLevel>
);

const createMapStateToProps = () => {
  const selectSupportingArticles = createSelectSupportingArticles();
  return (state: State, { cardId }: OuterProps) => ({
    supporting: selectSupportingArticles(state, { cardId }),
  });
};

export default connect(createMapStateToProps)(CardLevel);
