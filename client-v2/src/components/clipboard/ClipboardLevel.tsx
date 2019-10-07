import React from 'react';
import { Level, LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import { State } from 'types/State';
import { selectClipboardArticles } from 'selectors/clipboardSelectors';
import { connect } from 'react-redux';
import { Card } from 'shared/types/Collection';
import ArticleDrag, {
  dragOffsetX,
  dragOffsetY
} from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import DropZone, { DefaultDropContainer } from 'components/DropZone';
import { collectionDropTypeBlacklist } from 'constants/fronts';
import { styled, theme } from 'constants/theme';

interface OuterProps {
  children: LevelChild<Card>;
  onMove: MoveHandler<Card>;
  onDrop: DropHandler;
}

interface InnerProps {
  cards: Card[];
}

type Props = OuterProps & InnerProps;

const ClipboardItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  /* Offset to align the start of the cards with the clipboard open tab */
  margin-top: 7px;
`;

const ClipboardDropContainer = styled(DefaultDropContainer)<{
  index: number;
  length: number;
}>`
  flex-basis: 8px;
  flex-grow: ${({ index, length }) => (index === length ? 1 : 0)};
`;

const ClipboardLevel = ({ children, cards, onMove, onDrop }: Props) => (
  <Level
    containerElement={ClipboardItemContainer}
    blacklistedDataTransferTypes={collectionDropTypeBlacklist}
    arr={cards}
    parentType="clipboard"
    parentId="clipboard"
    type="card"
    dragImageOffsetX={dragOffsetX}
    dragImageOffsetY={dragOffsetY}
    getId={({ uuid }) => uuid}
    onMove={onMove}
    onDrop={onDrop}
    renderDrag={af => <ArticleDrag id={af.uuid} />}
    renderDrop={props => (
      <DropZone
        {...props}
        dropColor={theme.base.colors.dropZoneActiveStory}
        dropContainer={ClipboardDropContainer}
      />
    )}
  >
    {children}
  </Level>
);

const mapStateToProps = (state: State) => ({
  cards: selectClipboardArticles(state)
});

export default connect(mapStateToProps)(ClipboardLevel);
