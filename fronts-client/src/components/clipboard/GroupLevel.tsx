import React from 'react';
import { LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import type { State } from 'types/State';
import { connect } from 'react-redux';
import { Card } from 'types/Collection';
import DropZone, { DefaultDropContainer } from 'components/DropZone';
import { createSelectArticlesFromIds } from 'selectors/shared';
import { theme, styled } from 'constants/theme';
import { CardTypeLevel } from 'lib/dnd/CardTypeLevel';

interface OuterProps {
	groupId: string;
	cardIds: string[];
	children: LevelChild<Card>;
	onMove: MoveHandler<Card>;
	onDrop: DropHandler;
	isUneditable?: boolean;
	groupName: string;
	numberOfCardsInGroup: number;
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
	groupName,
	numberOfCardsInGroup
}: Props) => (
	<CardTypeLevel
		arr={cards}
		parentType="group"
		parentId={groupId}
		groupName={groupName}
		numberOfCardsInGroup={numberOfCardsInGroup}
		onMove={onMove}
		onDrop={onDrop}
		canDrop={!isUneditable}
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
	</CardTypeLevel>
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
