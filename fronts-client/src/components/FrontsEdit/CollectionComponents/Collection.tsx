import { Dispatch } from 'types/Store';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { HeadlineContentButton } from 'components/CollectionDisplay';
import CollectionDisplay from 'components/CollectionDisplay';
import CollectionNotification from 'components/CollectionNotification';
import Button from 'components/inputs/ButtonDefault';
import { AlsoOnDetail } from 'types/Collection';
import {
	publishCollection,
	discardDraftChangesToCollection,
	openCollectionsAndFetchTheirArticles,
} from 'actions/Collections';
import { actions, selectors } from 'bundles/collectionsBundle';
import {
	selectHasUnpublishedChanges,
	selectCollectionHasPrefill,
	selectCollectionIsHidden,
	selectCollectionDisplayName,
	selectCollectionCanMoveToRelativeIndex,
	selectCollectionTargetedRegions,
} from 'selectors/frontsSelectors';
import { selectIsCollectionLocked } from 'selectors/collectionSelectors';
import type { State } from 'types/State';
import { CardSets, Group } from 'types/Collection';
import {
	createSelectCollectionStageGroups,
	createSelectCollectionEditWarning,
	createSelectPreviouslyLiveArticlesInCollection,
} from 'selectors/shared';
import {
	selectIsCollectionOpen,
	editorCloseCollections,
	selectHasMultipleFrontsOpen,
	createSelectDoesCollectionHaveOpenForms,
} from 'bundles/frontsUI';
import { fetchCardReferencedEntitiesForCollections } from 'actions/Collections';
import { cardSets } from 'constants/fronts';
import CollectionMetaContainer from 'components/collection/CollectionMetaContainer';
import ButtonCircularCaret from 'components/inputs/ButtonCircularCaret';
import { theme, styled } from 'constants/theme';
import EditModeVisibility from 'components/util/EditModeVisibility';
import { fetchPrefill } from 'bundles/capiFeedBundle';
import LoadingGif from 'images/icons/loading.gif';
import OpenFormsWarning from './OpenFormsWarning';
import { selectors as editionsIssueSelectors } from '../../../bundles/editionsIssueBundle';
import { moveFrontCollection } from '../../../actions/Editions';

interface CollectionPropsBeforeState {
	id: string;
	children: (
		group: Group,
		isUneditable: boolean,
		showGroupName?: boolean,
	) => React.ReactNode;
	alsoOn: { [id: string]: AlsoOnDetail };
	frontId: string;
	browsingStage: CardSets;
	priority: string;
	isFeast?: boolean;
}

type CollectionProps = CollectionPropsBeforeState & {
	publishCollection: (collectionId: string, frontId: string) => Promise<void>;
	discardDraftChangesToCollection: (
		collectionId: string,
	) => Promise<void | string[]>;
	hasUnpublishedChanges: boolean;
	canPublish: boolean;
	groups: Group[];
	previousGroup: Group;
	displayEditWarning: boolean;
	isCollectionLocked: boolean;
	isOpen: boolean;
	hasOpenForms: boolean;
	hasContent: boolean;
	hasMultipleFrontsOpen: boolean;
	onChangeOpenState: (id: string, isOpen: boolean) => void;
	fetchPreviousCollectionArticles: (id: string) => void;
	fetchPrefill: (id: string) => void;
	hasPrefill: boolean;
	setHidden: (id: string, isHidden: boolean) => void;
	isHidden: boolean;
	displayName: string;
	targetedRegions: string[];
	canMoveUp: boolean;
	canMoveDown: boolean;
	moveFrontCollection: (
		frontId: string,
		id: string,
		direction: 'up' | 'down',
	) => void;
};

interface CollectionState {
	showOpenFormsWarning: boolean;
	isPreviouslyOpen: boolean;
	isLaunching: boolean;
}

const PreviouslyCollectionContainer = styled.div``;

const PreviouslyCollectionToggle = styled(CollectionMetaContainer)`
	align-items: center;
	font-size: 14px;
	font-weight: normal;
	padding-top: 0.25em;
	justify-content: unset;
	border-top: 1px solid ${theme.colors.greyMediumLight};
`;

const PreviouslyGroupsWrapper = styled.div`
	padding-top: 0.25em;
	opacity: 0.5;
`;

const PreviouslyCollectionInfo = styled.div`
	background: ${theme.colors.greyVeryLight};
	color: ${theme.colors.blackDark};
	padding: 4px 6px;
	font-size: 14px;
`;

const LoadingImageBox = styled.div`
	min-width: 50px;
`;

const PreviouslyCircularCaret = styled(ButtonCircularCaret)`
	height: 15px;
	width: 15px;
	background-color: ${theme.colors.greyMediumLight};
	margin-left: 6px;
	svg {
		height: 15px;
		width: 15px;
	}
`;

const OpenFormsWarningContainer = styled.div`
	position: absolute;
	top: 100%;
	left: 0;
	border: 1px solid ${theme.base.colors.brandColor};
	background-color: ${theme.base.colors.brandColorLight};
	padding: 10px;
	font-family: TS3TextSans;
	font-weight: normal;
	font-size: 12px;
	line-height: 14px;
`;

const ActionButtonsContainer = styled.div`
	display: flex;
`;

const MoveButtonsContainer = styled.div`
	margin-right: 8px;
	display: flex;
	gap: 3px;
`;

class Collection extends React.Component<CollectionProps, CollectionState> {
	public state = {
		isPreviouslyOpen: false,
		isLaunching: false,
		showOpenFormsWarning: false,
	};

	// added to prevent setState call on unmounted component
	public isComponentMounted = false;

	public componentDidMount() {
		this.isComponentMounted = true;
	}

	public componentWillUnmount() {
		this.isComponentMounted = false;
	}

	public togglePreviouslyOpen = () => {
		const { isPreviouslyOpen } = this.state;
		if (!isPreviouslyOpen) {
			this.props.fetchPreviousCollectionArticles(this.props.id);
		}
		this.setState({ isPreviouslyOpen: !isPreviouslyOpen });
	};

	public startPublish = (id: string, frontId: string) => {
		this.setState({ isLaunching: true });
		this.props.publishCollection(id, frontId).then((res) => {
			if (this.isComponentMounted) {
				this.setState({ isLaunching: false });
			}
		});
	};

	public render() {
		const {
			id,
			frontId,
			children,
			alsoOn,
			groups,
			previousGroup: previousGroup,
			browsingStage,
			hasUnpublishedChanges,
			canPublish = true,
			displayEditWarning,
			isCollectionLocked,
			isOpen,
			onChangeOpenState,
			hasMultipleFrontsOpen,
			discardDraftChangesToCollection: discardDraftChanges,
			hasPrefill,
			isHidden,
			targetedRegions,
			hasContent,
			hasOpenForms,
			isFeast,
		} = this.props;

		const { isPreviouslyOpen, isLaunching } = this.state;

		const isUneditable = isCollectionLocked || browsingStage !== cardSets.draft;

		return (
			<>
				<CollectionDisplay
					frontId={frontId}
					id={id}
					browsingStage={browsingStage}
					isUneditable={isUneditable}
					isLocked={isCollectionLocked}
					isOpen={isOpen}
					hasMultipleFrontsOpen={hasMultipleFrontsOpen}
					onChangeOpenState={() => onChangeOpenState(id, isOpen)}
					headlineContent={
						hasUnpublishedChanges &&
						canPublish && (
							<Fragment>
								<EditModeVisibility visibleMode="editions">
									{!isFeast && (
										<HeadlineContentButton
											priority="default"
											onClick={() => this.props.setHidden(id, !isHidden)}
											title="Toggle the visibility of this container in this issue."
										>
											{isHidden ? 'Unhide' : 'Hide'}
										</HeadlineContentButton>
									)}
									{isFeast && (
										<>
											{targetedRegions?.length > 0 ? 'USSSSSSSSS' : ''}{' '}
											{/*This will appear on collection headers to show US tagged collections, for testing purpose only.*/}
											<MoveButtonsContainer>
												<ButtonCircularCaret
													small
													openDir="up"
													disabled={!this.props.canMoveUp}
													onClick={() =>
														this.props.moveFrontCollection(
															this.props.frontId,
															this.props.id,
															'up',
														)
													}
												/>
												<ButtonCircularCaret
													small
													disabled={!this.props.canMoveDown}
													onClick={() =>
														this.props.moveFrontCollection(
															this.props.frontId,
															this.props.id,
															'down',
														)
													}
												/>
											</MoveButtonsContainer>
										</>
									)}
									{hasPrefill && (
										<HeadlineContentButton
											data-testid="prefill-button"
											priority="default"
											onClick={() => this.props.fetchPrefill(id)}
											title="Get suggested articles for this collection"
										>
											Suggest
										</HeadlineContentButton>
									)}
								</EditModeVisibility>
								<ActionButtonsContainer
									onMouseEnter={this.showOpenFormsWarning}
									onMouseLeave={this.hideOpenFormsWarning}
								>
									{hasOpenForms && this.state.showOpenFormsWarning && (
										<OpenFormsWarningContainer>
											<OpenFormsWarning collectionId={id} frontId={frontId} />
										</OpenFormsWarningContainer>
									)}
									<EditModeVisibility visibleMode="fronts">
										<Button
											size="l"
											priority="default"
											onClick={() => discardDraftChanges(id)}
											tabIndex={-1}
											data-testid="collection-discard-button"
										>
											Discard
										</Button>
										<Button
											size="l"
											priority="primary"
											onClick={() => this.startPublish(id, frontId)}
											tabIndex={-1}
											disabled={isLaunching}
											data-testid="collection-launch-button"
										>
											{isLaunching ? (
												<LoadingImageBox>
													<img src={LoadingGif} />
												</LoadingImageBox>
											) : (
												'Launch'
											)}
										</Button>
									</EditModeVisibility>
								</ActionButtonsContainer>
							</Fragment>
						)
					}
					metaContent={
						alsoOn[id].fronts.length || displayEditWarning ? (
							<CollectionNotification
								displayEditWarning={displayEditWarning}
								alsoOn={alsoOn[id]}
							/>
						) : null
					}
				>
					{groups.map((group) => children(group, isUneditable, true))}
					{hasContent && (
						<EditModeVisibility visibleMode="fronts">
							<PreviouslyCollectionContainer data-testid="previously">
								<PreviouslyCollectionToggle
									onClick={this.togglePreviouslyOpen}
									data-testid="previously-toggle"
								>
									Recently removed from launched front
									<PreviouslyCircularCaret active={isPreviouslyOpen} />
								</PreviouslyCollectionToggle>
								{isPreviouslyOpen && (
									<>
										<PreviouslyCollectionInfo>
											This contains the 5 most recently deleted articles from
											the live front. If the deleted articles were never
											launched they will not appear here.
										</PreviouslyCollectionInfo>
										<PreviouslyGroupsWrapper>
											{children(previousGroup, true, false)}
										</PreviouslyGroupsWrapper>
									</>
								)}
							</PreviouslyCollectionContainer>
						</EditModeVisibility>
					)}
				</CollectionDisplay>
			</>
		);
	}

	private showOpenFormsWarning = () =>
		this.setState({ showOpenFormsWarning: true });
	private hideOpenFormsWarning = () =>
		this.setState({ showOpenFormsWarning: false });
}

const createMapStateToProps = () => {
	const selectCollectionStageGroups = createSelectCollectionStageGroups();
	const selectEditWarning = createSelectCollectionEditWarning();
	const selectPreviously = createSelectPreviouslyLiveArticlesInCollection();
	const selectHasOpenForms = createSelectDoesCollectionHaveOpenForms();
	return (
		state: State,
		{
			browsingStage,
			id: collectionId,
			priority,
			frontId,
		}: CollectionPropsBeforeState,
	) => ({
		canMoveUp: selectCollectionCanMoveToRelativeIndex(
			state,
			frontId,
			collectionId,
			-1,
		),
		canMoveDown: selectCollectionCanMoveToRelativeIndex(
			state,
			frontId,
			collectionId,
			1,
		),
		isHidden: selectCollectionIsHidden(state, collectionId),
		displayName: selectCollectionDisplayName(state, collectionId),
		targetedRegions: selectCollectionTargetedRegions(state, collectionId),
		hasPrefill: selectCollectionHasPrefill(state, collectionId),
		hasUnpublishedChanges: selectHasUnpublishedChanges(state, {
			collectionId,
		}),
		isCollectionLocked: selectIsCollectionLocked(state, collectionId),
		groups: selectCollectionStageGroups(state, {
			collectionSet: browsingStage,
			collectionId,
		}),
		previousGroup: selectPreviously(state, {
			collectionId,
		}),
		displayEditWarning: selectEditWarning(state, {
			collectionId,
		}),
		isOpen: selectIsCollectionOpen(state, collectionId),
		hasMultipleFrontsOpen: selectHasMultipleFrontsOpen(state, priority),
		hasContent: !!selectors.selectById(state, collectionId),
		hasOpenForms: selectHasOpenForms(state, { collectionId, frontId }),
		isFeast: editionsIssueSelectors.selectAll(state)?.platform === 'feast',
	});
};

const mapDispatchToProps = (
	dispatch: Dispatch,
	{ browsingStage, frontId }: CollectionPropsBeforeState,
) => ({
	fetchPrefill: (id: string) => dispatch(fetchPrefill(id)),
	setHidden: (id: string, isHidden: boolean) =>
		dispatch(actions.setHiddenAndPersist(id, isHidden)),
	publishCollection: (id: string) => dispatch(publishCollection(id, frontId)),

	discardDraftChangesToCollection: (id: string) =>
		dispatch(discardDraftChangesToCollection(id)),
	onChangeOpenState: (id: string, isOpen: boolean) => {
		if (isOpen) {
			dispatch(editorCloseCollections(id));
		} else {
			dispatch(
				openCollectionsAndFetchTheirArticles([id], frontId, browsingStage),
			);
		}
	},
	fetchPreviousCollectionArticles: (id: string) => {
		dispatch(
			fetchCardReferencedEntitiesForCollections([id], cardSets.previously),
		);
	},
	moveFrontCollection: (
		frontId: string,
		id: string,
		direction: 'up' | 'down',
	) => dispatch(moveFrontCollection(frontId, id, direction)),
});

export default connect(createMapStateToProps, mapDispatchToProps)(Collection);
