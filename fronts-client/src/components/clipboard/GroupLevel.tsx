import React from 'react';
import { LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import type { State } from 'types/State';
import { connect } from 'react-redux';
import { Card, Group } from 'types/Collection';
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
	collectionId: string;
	groupName: string;
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
	groupMaxItems,
	groupsWithCardsData,
}: Props) => (
	<CardTypeLevel
		arr={cards}
		parentType="group"
		parentId={groupId}
		collectionId={collectionId}
		groupName={groupName}
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

	const getCardsForOtherGroups = () => {
		return (state: State, groups: Group[] | undefined) => {
			if (!groups) {
				return [];
			}

			return groups.map((group) => {
				const cardsData = selectArticlesFromIds(state, {
					cardIds: group.cards,
				});
				return {
					...group,
					cardsData,
				};
			});
		};
	};
	return (state: State, { cardIds, groups }: OuterProps) => ({
		cards: selectArticlesFromIds(state, {
			cardIds,
		}),
		groupsWithCardsData: getCardsForOtherGroups()(state, groups),
	});
};

export default connect(createMapStateToProps)(GroupLevel);
