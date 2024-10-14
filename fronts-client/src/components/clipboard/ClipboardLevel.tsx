import React from 'react';
import { LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import type { State } from 'types/State';
import { selectClipboardArticles } from 'selectors/clipboardSelectors';
import { connect } from 'react-redux';
import { Card } from 'types/Collection';
import DropZone, { DefaultDropContainer } from 'components/DropZone';
import { styled, theme } from 'constants/theme';
import { CardTypeLevel } from 'lib/dnd/CardTypeLevel';

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
	<CardTypeLevel
		containerElement={ClipboardItemContainer}
		arr={cards}
		parentType="clipboard"
		parentId="clipboard"
		onMove={onMove}
		onDrop={onDrop}
		renderDrop={(props) => (
			<DropZone
				{...props}
				dropColor={theme.base.colors.dropZoneActiveStory}
				dropContainer={ClipboardDropContainer}
			/>
		)}
	>
		{children}
	</CardTypeLevel>
);

const mapStateToProps = (state: State) => ({
	cards: selectClipboardArticles(state),
});

export default connect(mapStateToProps)(ClipboardLevel);
