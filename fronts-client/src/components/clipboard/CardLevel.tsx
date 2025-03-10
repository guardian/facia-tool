import React from 'react';
import { LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import type { State } from 'types/State';
import { connect } from 'react-redux';
import { Card, Group } from 'types/Collection';
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
	groupName?: string;
	groupIds?: string[];
	groups?: Group[];
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
	groupName,
	groupIds,
	groups,
}: Props) => (
	<CardTypeLevel
		arr={supporting || []}
		parentType="card"
		parentId={cardId}
		groupName={groupName}
		groupIds={groupIds}
		groupsData={groups}
		onMove={onMove}
		onDrop={onDrop}
		canDrop={!isUneditable}
		cardTypeAllowList={cardTypeAllowList}
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
