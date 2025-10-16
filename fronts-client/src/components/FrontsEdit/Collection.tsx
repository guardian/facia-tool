import React from 'react';
import { styled, Theme } from 'constants/theme';
import Collection from './CollectionComponents/Collection';
import {
	CollectionsWhichAreAlsoOnOtherFronts,
	CardMeta,
} from 'types/Collection';
import { CardSets, Card as TCard } from 'types/Collection';
import GroupDisplayComponent from 'components/GroupDisplay';
import GroupLevel from 'components/clipboard/GroupLevel';
import Card from '../card/Card';
import CardLevel from 'components/clipboard/CardLevel';
import { PosSpec, Move } from 'lib/dnd';
import { Dispatch } from 'types/Store';
import { addImageToCard, removeCard as removeCardAction } from 'actions/Cards';
import { resetFocusState } from 'bundles/focusBundle';
import { connect } from 'react-redux';
import type { State } from 'types/State';
import { createSelectArticleVisibilityDetails } from 'selectors/frontsSelectors';
import FocusWrapper from 'components/FocusWrapper';
import { CardTypes } from 'constants/cardTypes';
import { updateCardMetaWithPersist as updateCardMetaAction } from 'actions/Cards';
import { ValidationResponse } from '../../util/validateImageSrc';
import { bindActionCreators } from 'redux';

const getArticleNotifications = (
	id: string,
	lastDesktopArticle?: string,
	lastMobileArticle?: string,
) => {
	const notifications = [];
	if (lastDesktopArticle === id) {
		notifications.push('desktop');
	}
	if (lastMobileArticle === id) {
		notifications.push('mobile');
	}
	return notifications;
};

const CollectionWrapper = styled.div`
	& + & {
		margin-top: 10px;
	}
`;

const Notification = styled.span`
	display: inline-block;
	margin-left: 0.25em;
`;

const selectGrey = ({ theme }: { theme: Theme }) =>
	theme.colors.greyMediumLight;

const VisibilityDividerEl = styled.div`
	display: flex;
	font-weight: bold;
	font-size: 12px;
	line-height: 1;
	margin: 0.5em 0;
	text-transform: capitalize;

	:before {
		background-image: linear-gradient(
			transparent 66.66666%,
			${selectGrey} 66.66666%,
			${selectGrey} 100%
		);
		background-position: 0px 2px;
		background-size: 3px 3px;
		content: '';
		display: block;
		flex: 1;
	}

	${Notification} + ${Notification} {
		:before {
			color: ${selectGrey};
			content: '|';
			margin-right: 0.25em;
		}
	}
`;

const VisibilityDivider = ({ notifications }: { notifications: string[] }) =>
	notifications.length ? (
		<VisibilityDividerEl>
			{notifications.map((notification) => (
				<Notification key={notification}>{notification}</Notification>
			))}
		</VisibilityDividerEl>
	) : null;

interface CollectionContextProps {
	id: string;
	frontId: string;
	priority: string;
	collectionsWhichAreAlsoOnOtherFronts: {
		[id: string]: CollectionsWhichAreAlsoOnOtherFronts;
	};
	browsingStage: CardSets;
	size?: 'medium' | 'default' | 'wide';
	handleMove: (move: Move<TCard>) => void;
	handleInsert: (e: React.DragEvent, to: PosSpec) => void;
	selectCard: (id: string, collectionId: string, isSupporting: boolean) => void;
}

interface ConnectedCollectionContextProps extends CollectionContextProps {
	handleArticleFocus: (
		e: React.FocusEvent<HTMLDivElement>,
		groupId: string,
		card: TCard,
		frontId: string,
	) => void;
	removeCard: (parentId: string, id: string) => void;
	removeSupportingCard: (parentId: string, id: string) => void;
	handleBlur: () => void;
	lastDesktopArticle?: string;
	lastMobileArticle?: string;
	updateCardMeta: (id: string, meta: CardMeta) => void;
	addImageToCard: (uuid: string, imageData: ValidationResponse) => void;
}

class CollectionContext extends React.Component<ConnectedCollectionContextProps> {
	public render() {
		const {
			id,
			frontId,
			handleBlur,
			priority,
			collectionsWhichAreAlsoOnOtherFronts,
			browsingStage,
			size = 'default',
			handleMove,
			handleInsert,
			handleArticleFocus,
			selectCard,
			removeCard,
			removeSupportingCard,
			lastDesktopArticle,
			lastMobileArticle,
			updateCardMeta,
			addImageToCard,
		} = this.props;

		return (
			<CollectionWrapper data-testid="collection">
				<Collection
					key={id}
					id={id}
					priority={priority}
					frontId={frontId}
					collectionsWhichAreAlsoOnOtherFronts={
						collectionsWhichAreAlsoOnOtherFronts
					}
					canPublish={browsingStage !== 'live'}
					browsingStage={browsingStage}
				>
					{(group, isUneditable, groupIds, groups, showGroupName) => (
						<div key={group.uuid}>
							<GroupDisplayComponent
								key={group.uuid}
								groupName={showGroupName ? group.name : null}
							/>
							<GroupLevel
								isUneditable={isUneditable}
								groupId={group.uuid}
								collectionId={id}
								groupName={group.name ? group.name : ''}
								groupIds={groupIds}
								groupMaxItems={group.maxItems}
								groups={groups}
								onMove={handleMove}
								onDrop={handleInsert}
								cardIds={group.cards}
							>
								{(card, getAfNodeProps) => (
									<>
										<FocusWrapper
											tabIndex={0}
											area="collection"
											onBlur={() => handleBlur()}
											onFocus={(e: React.FocusEvent<HTMLDivElement>) =>
												handleArticleFocus(e, group.uuid, card, frontId)
											}
											uuid={card.uuid}
										>
											<Card
												frontId={frontId}
												collectionId={id}
												uuid={card.uuid}
												parentId={group.uuid}
												isUneditable={isUneditable}
												size={size}
												canShowPageViewData={true}
												getNodeProps={() => getAfNodeProps(isUneditable)}
												onSelect={() => selectCard(card.uuid, id, false)}
												onDelete={() => removeCard(group.uuid, card.uuid)}
												groupSizeId={group.id ? parseInt(group.id) : 0}
												updateCardMeta={updateCardMeta}
												addImageToCard={addImageToCard}
											>
												<CardLevel
													isUneditable={isUneditable}
													cardId={card.uuid}
													groupName={group.name ? group.name : ''}
													groupIds={groupIds}
													groups={groups}
													onMove={handleMove}
													onDrop={handleInsert}
													cardTypeAllowList={this.getPermittedCardTypes(
														card.cardType,
													)}
													dropMessage={this.getDropMessage(card.cardType)}
												>
													{(supporting, getSupportingProps) => (
														<Card
															frontId={frontId}
															uuid={supporting.uuid}
															parentId={card.uuid}
															canShowPageViewData={false}
															onSelect={() =>
																selectCard(supporting.uuid, id, true)
															}
															isUneditable={isUneditable}
															getNodeProps={() =>
																getSupportingProps(isUneditable)
															}
															onDelete={() =>
																removeSupportingCard(card.uuid, supporting.uuid)
															}
															size="small"
															updateCardMeta={updateCardMeta}
															addImageToCard={addImageToCard}
														/>
													)}
												</CardLevel>
											</Card>
										</FocusWrapper>
										<VisibilityDivider
											notifications={getArticleNotifications(
												card.uuid,
												lastDesktopArticle,
												lastMobileArticle,
											)}
										/>
									</>
								)}
							</GroupLevel>
						</div>
					)}
				</Collection>
			</CollectionWrapper>
		);
	}

	private getPermittedCardTypes = (
		cardType?: CardTypes,
	): CardTypes[] | undefined =>
		cardType === 'feast-collection' ? ['recipe'] : undefined; // Todo: Chef also to be checked?

	private getDropMessage = (cardType?: CardTypes) =>
		cardType === 'feast-collection' ? 'Place recipe here' : 'Sublink';
}

const createMapStateToProps = () => {
	const selectArticleVisibilityDetails = createSelectArticleVisibilityDetails();
	return (state: State, props: CollectionContextProps) => {
		const articleVisibilityDetails = selectArticleVisibilityDetails(state, {
			collectionId: props.id,
			collectionSet: props.browsingStage,
		});

		return {
			lastDesktopArticle: articleVisibilityDetails.desktop,
			lastMobileArticle: articleVisibilityDetails.mobile,
		};
	};
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
	removeCard: (parentId: string, uuid: string) => {
		dispatch(removeCardAction('group', parentId, uuid, 'collection'));
	},
	removeSupportingCard: (parentId: string, uuid: string) => {
		dispatch(removeCardAction('card', parentId, uuid, 'collection'));
	},
	handleBlur: () => dispatch(resetFocusState()),
	...bindActionCreators(
		{
			updateCardMeta: updateCardMetaAction('collection'),
			addImageToCard: addImageToCard('collection'),
		},
		dispatch,
	),
});

export default connect(
	createMapStateToProps,
	mapDispatchToProps,
)(CollectionContext);
