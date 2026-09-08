import React from 'react';
import { LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import type { State } from 'types/State';
import { connect } from 'react-redux';
import { Card, Group } from 'types/Collection';
import DropZone, { DefaultDropContainer } from 'components/DropZone';
import {
	createSelectArticlesFromIds,
	selectCardsFromRootState,
} from 'selectors/shared';
import { theme, styled } from 'constants/theme';
import { CardTypeLevel } from 'lib/dnd/CardTypeLevel';
import { createShallowEqualResultSelector } from 'util/selectorUtils';

interface OuterProps {
	groupId: string;
	cardIds: string[];
	children: LevelChild<Card>;
	onMove: MoveHandler<Card>;
	onDrop: DropHandler;
	isUneditable?: boolean;
	collectionId: string;
	groupName: string;
	groupIds: string[];
	groupMaxItems?: number;
	groups?: Group[];
}

interface InnerProps {
	cards: Card[];
	groupsWithCardsData: Group[];
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
	collectionId,
	groupName,
	groupIds,
	groupMaxItems,
	groupsWithCardsData,
}: Props) => (
	<CardTypeLevel
		arr={cards}
		parentType="group"
		parentId={groupId}
		collectionId={collectionId}
		groupName={groupName}
		groupIds={groupIds}
		groupMaxItems={groupMaxItems}
		groupsData={groupsWithCardsData}
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
	const selectCardsForOtherGroups = createShallowEqualResultSelector(
		selectCardsFromRootState,
		(_: any, { groups }: { groups: Group[] }) => groups,
		(cards, groups) => {
			return groups.map((group) => {
				return {
					...group,
					cardsData: group.cards.map((afId) => cards[afId]),
				};
			});
		},
	);

	return (state: State, { cardIds, groups }: OuterProps) => {
		return {
			cards: selectArticlesFromIds(state, {
				cardIds,
			}),
			groupsWithCardsData: selectCardsForOtherGroups(state, {
				groups: groups || [],
			}),
		};
	};
};

export default connect(createMapStateToProps)(GroupLevel);
