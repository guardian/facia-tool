import React from 'react';
import { styled, theme } from 'constants/theme';
import { connect } from 'react-redux';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import { events } from 'services/GA';
import { DragAndDropRoot, PosSpec, Move } from 'lib/dnd';
import Collection from './Collection';
import type { State } from 'types/State';
import WithDimensions from 'components/util/WithDimensions';
import { selectFront } from 'selectors/frontsSelectors';
import { Dispatch } from 'types/Store';
import { Card as TCard, CardSets } from 'types/Collection';
import { FrontConfig } from 'types/FaciaApi';
import { moveCard } from 'actions/Cards';
import { insertCardFromDropEvent } from 'util/collectionUtils';
import { bindActionCreators } from 'redux';
import { editorSelectCard } from 'bundles/frontsUI';
import { initialiseCollectionsForFront } from 'actions/Collections';
import { createSelectAlsoOnFronts } from 'selectors/frontsSelectors';
import { AlsoOnDetail } from 'types/Collection';
import { selectors as collectionSelectors } from 'bundles/collectionsBundle';
import Raven from 'raven-js';

const STALENESS_THRESHOLD_IN_MILLIS = 30_000; // 30 seconds

const CollectionContainer = styled.div`
	position: relative;
	& + & {
		margin-top: 10px;
	}
`;

const FrontCollectionsContainer = styled.div`
	position: relative;
	overflow-y: scroll;
	max-height: calc(100% - 43px);
	padding-top: 1px;
	padding-bottom: ${theme.front.paddingForAddFrontButton}px;
`;

const EditingLockedCollectionsOverlay = styled.div`
	z-index: 80;
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: ${theme.colors.blackTransparent60};
	color: ${theme.base.colors.textLight};
	text-shadow: 0 0 10px ${theme.base.colors.textDark};
	display: flex;
	flex-direction: column;
	align-items: center;
	user-select: none;
	text-align: center;
	padding: 5px;
	h2 {
		margin: 0;
	}
`;

const isDropFromCAPIFeed = (e: React.DragEvent) =>
	e.dataTransfer.types.includes('capi');

interface FrontPropsBeforeState {
	id: string;
	browsingStage: CardSets;
	handleArticleFocus: (
		e: React.FocusEvent<HTMLDivElement>,
		groupId: string,
		card: TCard,
		frontId: string,
	) => void;
	onChangeCurrentCollectionId: (id: string) => void;
}

type FrontProps = FrontPropsBeforeState & {
	front: FrontConfig;
	alsoOn: { [id: string]: AlsoOnDetail };
	initialiseCollectionsForFront: (id: string, set: CardSets) => void;
	selectCard: (
		cardId: string,
		collectionId: string,
		frontId: string,
		isSupporting: boolean,
	) => void;
	moveCard: typeof moveCard;
	insertCardFromDropEvent: typeof insertCardFromDropEvent;
	collectionsError: string | null;
	collectionsLastSuccessfulFetchTimestamp: number | null;
};

interface FrontState {
	currentlyScrolledCollectionId: string | undefined;
	isCollectionsStale: boolean | undefined;
}

class FrontContent extends React.Component<FrontProps, FrontState> {
	public state = {
		currentlyScrolledCollectionId: undefined,
		isCollectionsStale: undefined,
	};
	private collectionElements: {
		[collectionId: string]: HTMLDivElement | null;
	} = {};
	private collectionContainerElement: HTMLDivElement | null = null;

	/**
	 * Handle a scroll event. We debounce this as it's called many times by the
	 * event handler, and triggers an expensive rerender.
	 */
	private handleScroll = debounce(() => {
		if (!this.collectionContainerElement) {
			return;
		}
		const scrollTop = this.collectionContainerElement.scrollTop;
		const currentIdsAndOffsets = Object.entries(this.collectionElements)
			.filter(
				([_, element]) =>
					// We filter everything that comes before the collection here, as we
					// know we won't need it. The constant here refers to the height of
					// the container heading.
					!!element &&
					element.offsetTop +
						element.clientHeight -
						theme.layout.sectionHeaderHeight >
						scrollTop,
			)
			.map(([id, element]) => [id, element!.offsetTop] as [string, number]);

		const sortedIdsAndOffsets = sortBy(
			currentIdsAndOffsets,
			([_, offset]) => offset,
		);
		const newCurrentCollectionId = sortedIdsAndOffsets[0][0];

		if (
			sortedIdsAndOffsets.length &&
			newCurrentCollectionId !== this.state.currentlyScrolledCollectionId
		) {
			this.props.onChangeCurrentCollectionId(newCurrentCollectionId);
		}
	}, 100);

	public UNSAFE_componentWillReceiveProps(newProps: FrontProps) {
		if (this.props.browsingStage !== newProps.browsingStage) {
			this.props.initialiseCollectionsForFront(
				this.props.id,
				this.props.browsingStage,
			);
		}
		if (
			this.props.collectionsLastSuccessfulFetchTimestamp !==
			newProps.collectionsLastSuccessfulFetchTimestamp
		) {
			this.updateCollectionsStalenessFlag();
			setTimeout(
				this.updateCollectionsStalenessFlag,
				STALENESS_THRESHOLD_IN_MILLIS,
			);
		}
		if (newProps.collectionsError && !this.props.collectionsError) {
			Raven.captureException(
				`Collections editing OUGHT TO BE locked due to error: ${newProps.collectionsError}`,
				{
					extra: {
						error: newProps.collectionsError,
					},
				},
			);
		}
	}

	public componentDidMount() {
		this.handleScroll();
		this.props.initialiseCollectionsForFront(
			this.props.id,
			this.props.browsingStage,
		);
	}

	public handleMove = (move: Move<TCard>) => {
		const numberOfArticlesAlreadyInGroup = move.to.cards?.length ?? 0;
		const hasMaxItemsAlready =
			move.to.groupMaxItems === numberOfArticlesAlreadyInGroup;

		// if we are moving an article into any group that is either empty or doesn't have the max items already,
		// or if we're moving the article within the same group,
		// then we just move the article to the location
		if (
			move.to.groupName === "standard" ||
			numberOfArticlesAlreadyInGroup === 0 ||
			!hasMaxItemsAlready ||
			(move.from && move.to.id === move.from.id)
		) {
			events.dropArticle(this.props.id, 'collection');
			this.props.moveCard(move.to, move.data, move.from || null, 'collection');
			return;
		}

		// if we're in a group with max items that already has the max number of stories,
		// and we move an article, then depending on where we're inserting the story
		// we need to either move the last article to the next group
		// or move the article into the next group
		if (
			!!move.to.groupIds &&
			move.to.cards !== undefined &&
			hasMaxItemsAlready
		) {
			const currentGroupIndex = move.to.groupIds.findIndex(
				(groupId) => groupId === move.to.id,
			);
			const nextGroup = move.to.groupIds[currentGroupIndex + 1];
			const isAddingCardToLastPlaceInGroup =
				move.to.index === move.to.cards.length;

			// if we're not adding the card to the last place in the group, then we need to move the last article to the next group
			if (!isAddingCardToLastPlaceInGroup) {
				//we do the regular move steps for the article we're moving to the group
				events.dropArticle(this.props.id, 'collection');
				this.props.moveCard(
					move.to,
					move.data,
					move.from || null,
					'collection',
				);

				//then we need to move the other article to the other group
				const existingCardData = move.to.cards[move.to.cards.length - 1];
				const nextGroupData =
					move.to.groupsData &&
					move.to.groupsData.find((group) => group.uuid === nextGroup);
				const existingCardTo = {
					index: 0,
					id: nextGroup,
					type: 'group',
					groupIds: move.to.groupIds,
					groupMaxItems: nextGroupData?.maxItems,
					groupsData: move.to.groupsData,
					cards: nextGroupData?.cardsData,
				};
				const existingCardMoveData: Move<TCard> = {
					data: existingCardData,
					from: false,
					to: existingCardTo,
				};
				this.handleMove(existingCardMoveData);
			}
			// If we're adding to the last place in the group, then we move the article into the next group
			// we need to check if the next group already has the max number of items,
			// if it does, then we need to move the last article to the next group
			else {
				// we do the move step for the article we're now moving to the next group
				const amendedTo = {
					index: 0,
					id: nextGroup,
					type: 'group',
					groupIds: move.to.groupIds,
				};
				events.dropArticle(this.props.id, 'collection');

				this.props.moveCard(
					amendedTo,
					move.data,
					move.from || null,
					'collection',
				);

				// then we check if the next group already has the max number of items,
				// if it does, then we need to move the last article to the next group
				const nextGroupData =
					move.to.groupsData &&
					move.to.groupsData.find((group) => group.uuid === nextGroup);
				const nextGroupNumberOfArticles = nextGroupData?.cardsData?.length ?? 0;
				const nextGroupHasMaxItems =
					nextGroupData?.maxItems === nextGroupNumberOfArticles;
				if (nextGroupHasMaxItems) {
					if (!nextGroupData.cardsData) {
						return;
					}
					const existingCardData =
						nextGroupData.cardsData[nextGroupNumberOfArticles - 1];
					const existingCardTo = {
						index: 0,
						id: nextGroup,
						type: 'group',
						groupIds: move.to.groupIds,
						groupMaxItems: nextGroupData?.maxItems,
						groupsData: move.to.groupsData,
						cards: nextGroupData?.cardsData,
					};
					const existingCardMoveData: Move<TCard> = {
						data: existingCardData,
						from: false,
						to: existingCardTo,
					};
					this.handleMove(existingCardMoveData);
				}
			}
			return;
		}
	};

	public handleInsert = (e: React.DragEvent, to: PosSpec) => {
		const numberOfArticlesAlreadyInGroup = to.cards?.length ?? 0;
		const hasMaxItemsAlready =
			to.groupMaxItems === numberOfArticlesAlreadyInGroup;

		const dropSource = isDropFromCAPIFeed(e) ? 'feed' : 'url';

		// if we are inserting an article into any group that doesn't have a max items (e.g. legacy containers),
		// or a group that doesn't have any articles in it yet
		// or a group that doesn't have the max items already,
		// then we just insert
		if (
			to.type !== 'group' ||
			to.groupMaxItems === undefined ||
			numberOfArticlesAlreadyInGroup === 0 ||
			!hasMaxItemsAlready
		) {
			events.dropArticle(this.props.id, dropSource);
			this.props.insertCardFromDropEvent(e, to, 'collection');
			return;
		}

		// if we're in a group with max items and already has the max number of stories,
		// then depending on where we're inserting the story
		// we need to either move the last article to the next group
		// or insert the article into the next group
		if (!!to.groupIds && to.cards !== undefined && hasMaxItemsAlready) {
			const currentGroupIndex = to.groupIds.findIndex(
				(groupId) => groupId === to.id,
			);
			const nextGroup = to.groupIds[currentGroupIndex + 1];
			const nextGroupData =
				to.groupsData &&
				to.groupsData.find((group) => group.uuid === nextGroup);
			const isAddingCardToLastPlaceInGroup = to.index === to.cards.length;

			// if we're not adding the card to the last place in the group, then we need to move the last article to the next group
			if (!isAddingCardToLastPlaceInGroup) {
				// we do the regular insert steps for the article we're inserting to the group

				events.dropArticle(this.props.id, dropSource);
				this.props.insertCardFromDropEvent(e, to, 'collection');

				// then we move the other article to the other group
				const existingCardData = to.cards[to.cards.length - 1];
				const existingCardTo = {
					index: 0,
					id: nextGroup,
					type: 'group',
					groupIds: to.groupIds,
					groupMaxItems: nextGroupData?.maxItems,
					groupsData: to.groupsData,
					cards: nextGroupData?.cardsData,
				};
				const existingCardMoveData: Move<TCard> = {
					data: existingCardData,
					from: false,
					to: existingCardTo,
				};
				this.handleMove(existingCardMoveData);
			}
			// If we're adding to the last place in the group, then we insert the article into the next group
			// we need to check if the next group already has the max number of items,
			// if it does, then we need to move the last article to the next group
			else {
				const amendedTo = {
					index: 0,
					id: nextGroup,
					type: 'group',
					groupIds: to.groupIds,
				};
				events.dropArticle(this.props.id, dropSource);
				this.props.insertCardFromDropEvent(e, amendedTo, 'collection');

				const nextGroupNumberOfArticles = nextGroupData?.cardsData?.length ?? 0;
				const nextGroupHasMaxItems =
					nextGroupData?.maxItems === nextGroupNumberOfArticles;
				if (nextGroupHasMaxItems) {
					if (!nextGroupData.cardsData) {
						return;
					}
					const existingCardData = nextGroupData.cardsData[to.cards.length - 1];
					const existingCardTo = {
						index: 0,
						id: nextGroup,
						type: 'group',
						groupIds: to.groupIds,
						groupMaxItems: nextGroupData?.maxItems,
						groupsData: to.groupsData,
						cards: nextGroupData?.cardsData,
					};
					const existingCardMoveData: Move<TCard> = {
						data: existingCardData,
						from: false,
						to: existingCardTo,
					};
					this.handleMove(existingCardMoveData);
				}
			}
			return;
		}
	};

	public render() {
		const { front, collectionsError } = this.props;

		// TODO remove the false bit when we're happy to actually lock users editing
		const isEditingLocked =
			false && (this.state.isCollectionsStale || !!collectionsError);

		return (
			<FrontCollectionsContainer
				onScroll={this.handleScroll}
				ref={(ref: HTMLDivElement | null) =>
					(this.collectionContainerElement = ref)
				}
			>
				<WithDimensions>
					{({ width }) => (
						<DragAndDropRoot id={this.props.id} data-testid={this.props.id}>
							{front.collections.map((collectionId) => (
								<CollectionContainer
									key={collectionId}
									ref={(ref: HTMLDivElement | null) =>
										(this.collectionElements[collectionId] = ref)
									}
								>
									{isEditingLocked && (
										<EditingLockedCollectionsOverlay>
											<h2>Editing Locked</h2>
											<span>
												We couldn't refresh this collection. It may be out of
												date. Please wait or reload.
											</span>
										</EditingLockedCollectionsOverlay>
									)}
									<Collection
										id={collectionId}
										frontId={this.props.id}
										priority={front.priority}
										browsingStage={this.props.browsingStage}
										alsoOn={this.props.alsoOn}
										handleInsert={this.handleInsert}
										handleMove={this.handleMove}
										size={
											width && width > 750
												? 'wide'
												: width && width > 500
													? 'default'
													: 'medium'
										}
										selectCard={this.onSelectCard}
										handleArticleFocus={this.props.handleArticleFocus}
									/>
								</CollectionContainer>
							))}
						</DragAndDropRoot>
					)}
				</WithDimensions>
			</FrontCollectionsContainer>
		);
	}

	private onSelectCard = (
		cardId: string,
		collectionId: string,
		isSupporting: boolean,
	) => this.props.selectCard(cardId, collectionId, this.props.id, isSupporting);

	private updateCollectionsStalenessFlag = () => {
		const collectionsStalenessInMillis = !!this.props
			.collectionsLastSuccessfulFetchTimestamp
			? Date.now() - this.props.collectionsLastSuccessfulFetchTimestamp
			: 0;

		const isCollectionsStale =
			collectionsStalenessInMillis > STALENESS_THRESHOLD_IN_MILLIS;

		if (!this.state.isCollectionsStale && isCollectionsStale) {
			Raven.captureMessage(
				'Collections editing OUGHT TO BE locked due to staleness.',
				{
					extra: {
						collectionsStalenessInMillis,
					},
				},
			);
		}

		if (this.state.isCollectionsStale !== isCollectionsStale) {
			this.setState({ isCollectionsStale });
		}
	};
}

const mapStateToProps = () => {
	const selectAlsoOnFronts = createSelectAlsoOnFronts();
	return (state: State, { id }: FrontPropsBeforeState) => {
		return {
			front: selectFront(state, { frontId: id }),
			alsoOn: selectAlsoOnFronts(state, { frontId: id }),
			collectionsError: collectionSelectors.selectCurrentError(state),
			collectionsLastSuccessfulFetchTimestamp:
				collectionSelectors.selectLastSuccessfulFetchTimestamp(state),
		};
	};
};

const mapDispatchToProps = (dispatch: Dispatch) =>
	bindActionCreators(
		{
			selectCard: editorSelectCard,
			initialiseCollectionsForFront,
			moveCard,
			insertCardFromDropEvent,
		},
		dispatch,
	);

export default connect(mapStateToProps, mapDispatchToProps)(FrontContent);
