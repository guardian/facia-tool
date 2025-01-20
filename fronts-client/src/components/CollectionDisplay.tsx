import React from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import distanceFromNow from 'date-fns/distance_in_words_to_now';
import upperFirst from 'lodash/upperFirst';
import { oc } from 'ts-optchain';

import ShortVerticalPinline from './layout/ShortVerticalPinline';
import ContainerHeadingPinline from './typography/ContainerHeadingPinline';
import {
	Collection,
	CardSets,
	Collection as CollectionType,
} from '../types/Collection';
import DragIntentContainer from './DragIntentContainer';
import ButtonCircularCaret, {
	ButtonCircularWithTransition,
} from './inputs/ButtonCircularCaret';
import type { State } from 'types/State';

import { createSelectCardsInCollection } from '../selectors/shared';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';
import FadeIn from './animation/FadeIn';
import ContentContainer, {
	contentContainerMargin,
} from './layout/ContentContainer';
import { css } from 'styled-components';
import { events } from 'services/GA';
import CollectionMetaContainer from './collection/CollectionMetaContainer';
import { resetFocusState, setFocusState } from 'bundles/focusBundle';
import { Dispatch } from 'types/Store';
import { theme } from 'constants/theme';
import Button from 'components/inputs/ButtonDefault';
import { updateCollection as updateCollectionAction } from '../actions/Collections';
import { isMode } from '../selectors/pathSelectors';
import { DragToConvertFeastCollection } from './FrontsEdit/CollectionComponents/DragToConvertFeastCollection';
import { selectors as editionsIssueSelectors } from '../bundles/editionsIssueBundle';
import { Menu } from '@headlessui/react';
import { removeFrontCollection } from '../actions/Editions';
import { EditionsCollection } from '../types/Edition';

export const createCollectionId = ({ id }: Collection, frontId: string) =>
	`front-${frontId}-collection-${id}`;

interface ContainerProps {
	id: string;
	browsingStage: CardSets;
	frontId: string;
	isFeast?: boolean;
}

type Props = ContainerProps & {
	collection: Collection | undefined;
	cardIds?: string[];
	headlineContent: React.ReactNode;
	metaContent: React.ReactNode;
	children: React.ReactNode;
	isUneditable?: boolean;
	underlyingCollection?: Collection;
	isLocked?: boolean;
	isOpen?: boolean;
	hasMultipleFrontsOpen?: boolean;
	onChangeOpenState?: (isOpen: boolean) => void;
	handleFocus: (id: string) => void;
	handleBlur: () => void;
	updateCollection: (
		collection: Collection,
		renamingCollection: boolean,
		isMarkedForUSOnly: boolean /*At present for US but in future we can change this name to targetted_regions once more countries gets added in list*/,
	) => void;
	isEditions: boolean;
	removeFrontCollection: (frontId: string, collectionId: string) => void;
};

interface CollectionState {
	displayName: string;
	hasDragOpenIntent: boolean;
	editingContainerName: boolean;
	isDeleteClicked: boolean;
	isUSOnly: boolean;
}

const CollectionContainer = styled(ContentContainer)<{
	hasMultipleFrontsOpen?: boolean;
}>`
	background-color: ${(props) => props.theme.collection.background};

	&:focus {
		border: 1px solid ${(props) => props.theme.base.colors.focusColor};
		border-top: none;
		outline: none;
	}
	padding-bottom: 0;
`;

const HeadlineContentContainer = styled.span`
	position: relative;
	margin-right: -11px;
	display: flex;
	align-items: center;
	gap: 2px;
`;

export const HeadlineContentButton = styled(Button).attrs({ size: 's' })`
	color: #fff;
	padding: 0 5px;
	display: flex;
	align-items: center;
`;

const CollectionDisabledTheme = styled.div`
	position: absolute;
	background-color: hsla(0, 0%, 100%, 0.3);
	height: 100%;
	width: 100%;
	top: 0;
	left: 0;
`;

const LockedCollectionFlag = styled.span`
	font-family: GHGuardianHeadline;
	font-size: 22px;
	color: ${theme.base.colors.text};
	height: 40px;
	line-height: 40px;
	border-bottom: 1px solid ${theme.base.colors.borderColor};
`;

const CollectionMetaBase = styled.span`
	position: relative;
	padding-top: 3px;
	padding-right: 20px;
`;

const CollectionMeta = styled(CollectionMetaBase)`
	padding-left: 10px;
	flex-grow: 1;
`;

const ItemCountMeta = CollectionMetaBase;

const CollectionHeadingSticky = styled.div`
	position: sticky;
	top: 0;
	background-color: ${theme.collection.background};
	box-shadow: 0 -1px 0 ${theme.base.colors.text};
	z-index: 20;
	margin: 0 -${contentContainerMargin};
	padding: 0 ${contentContainerMargin};
`;

const CollectionHeadingInner = styled(ContainerHeadingPinline)`
	border-bottom: 1px solid ${theme.base.colors.borderColor};
`;

const CollectionHeadlineWithConfigContainer = styled.div`
	flex-grow: 1;
	min-width: 0;
	flex-basis: 100%;
`;

const CollectionHeadingText = styled.div<{
	isLoading: boolean;
	isSecondaryLevel?: boolean;
}>`
	width: 100%;
	white-space: nowrap;
	${({ isLoading }) =>
		isLoading &&
		css`
			color: ${theme.base.colors.textMuted};
		`} white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	${({ isSecondaryLevel }) =>
		isSecondaryLevel &&
		css`
			font-family: TS3TextSans;
			font-size: 20px;
		`}
`;

const CollectionToggleContainer = styled.div`
	padding-top: 5px;
	max-width: 130px;
	display: flex;
	justify-content: flex-end;
	z-index: 2;
	:hover {
		${ButtonCircularWithTransition} {
			background-color: ${theme.button.backgroundColorFocused};
		}
	}
`;

const CollectionConfigContainer = styled.div`
	display: inline-block;
	font-family: GHGuardianHeadline;
	font-size: 15px;
	color: ${theme.base.colors.text};
	white-space: nowrap;
	margin-left: 3px;
	vertical-align: bottom;
`;

const CollectionConfigText = styled.div`
	display: inline;
	font-weight: normal;
	font-style: normal;
`;

const CollectionConfigTextPipe = styled.span`
	color: ${theme.base.colors.borderColor};
`;

const CollectionShortVerticalPinline = styled(ShortVerticalPinline)`
	right: initial;
	left: 0;
`;

const TargetedTerritoryBox = styled.div`
	background-color: black;
	color: white;
	font-size: 15px;
	padding: 0 5px;
	span {
		font-size: 7px;
		vertical-align: middle;
	}
`;

const CollectionHeaderInput = styled.input`
	font-size: 22px;
	font-family: GHGuardianHeadline;
	font-weight: bold;
	width: 20em;
`;

class CollectionDisplay extends React.Component<Props, CollectionState> {
	public static defaultProps = {
		isUneditable: false,
		isOpen: true,
	};

	public state = {
		displayName: 'Loading...',
		hasDragOpenIntent: false,
		editingContainerName: false,
		isDeleteClicked: false,
		isUSOnly: false,
	};

	public toggleVisibility = () => {
		events.collectionToggleClicked(this.props.frontId);
		if (this.props.onChangeOpenState) {
			this.props.onChangeOpenState(!this.props.isOpen);
		}
	};

	public dropDownMenu = (collection: EditionsCollection) => {
		return (
			<div className="relative inline-block text-left">
				<Menu>
					{
						<>
							<Menu.Button
								className={
									'inline-flex items-center justify-center rounded bg-gray-800 text-white p-2 hover:bg-gray-700 focus:outline-none'
								}
								style={{ marginRight: '5px', marginBottom: '12px' }}
							>
								{/*  use of "style" here as changes in "classname" for margin didn't work, Can try again later */}
								Options{' '}
								{/*TODO - need "ellipsis" instead of "Options"? I tried checking with FontAwesomeIcon but not working..Need to check later*/}
							</Menu.Button>

							<Menu.Items className="absolute mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
								<div className="py-1">
									<Menu.Item>
										{({ active }) => (
											<HeadlineContentButton
												priority="default"
												onClick={this.handleDeleteClick}
												title="Delete the collection for this issue"
												style={{
													color: this.state.isDeleteClicked ? 'red' : 'white',
												}}
												className={`${
													active ? 'bg-gray-100' : ''
												} group flex w-full items-center rounded-md px-4 py-2 text-sm text-gray-700`}
											>
												Delete
											</HeadlineContentButton>
										)}
									</Menu.Item>

									<div className="my-1 h-px bg-gray-600" />

									<Menu.Item>
										{({ active }) => (
											<HeadlineContentButton
												priority="default"
												onClick={this.startRenameContainer}
												title="Rename this container in this issue."
											>
												Rename
											</HeadlineContentButton>
										)}
									</Menu.Item>

									<div className="my-1 h-px bg-gray-600" />

									<Menu.Item>
										{({ active }) => (
											<HeadlineContentButton
												priority="default"
												onClick={this.handleUSOnlyOption}
												title="Mark this container for US only"
												style={{
													color:
														collection?.targetedRegions?.length > 0
															? 'red'
															: 'white',
												}}
												className={`${
													active ? 'bg-gray-100' : ''
												} group flex w-full items-center rounded-md px-4 py-2 text-sm text-gray-700`}
											>
												US Only
												{this.state.isUSOnly && <h3>&#x2713;</h3>}
											</HeadlineContentButton>
										)}
									</Menu.Item>
								</div>
							</Menu.Items>
						</>
					}
				</Menu>
			</div>
		);
	};

	public render() {
		const {
			id,
			collection,
			frontId,
			cardIds,
			headlineContent,
			metaContent,
			isUneditable,
			isLocked,
			hasMultipleFrontsOpen,
			children,
			handleFocus,
			handleBlur,
			isEditions,
			isFeast,
		}: Props = this.props;
		const itemCount = cardIds ? cardIds.length : 0;
		const targetedTerritory = collection ? collection.targetedTerritory : null;
		const { displayName } = this.state;

		return (
			<CollectionContainer
				id={collection && createCollectionId(collection, frontId)}
				tabIndex={0}
				onFocus={() => handleFocus(id)}
				onBlur={handleBlur}
				hasMultipleFrontsOpen={hasMultipleFrontsOpen}
			>
				<CollectionHeadingSticky tabIndex={-1}>
					<CollectionHeadingInner>
						<CollectionHeadlineWithConfigContainer>
							{this.state.editingContainerName ? (
								<CollectionHeaderInput
									data-testid="rename-front-input"
									value={displayName}
									autoFocus
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										this.setState({ displayName: e.target.value });
									}}
									onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
										if (e.key === 'Enter') {
											this.setName();
										}
									}}
									onBlur={() => this.setName()}
								/>
							) : (
								<CollectionHeadingText
									isLoading={!collection}
									title={!!collection ? collection!.displayName : 'Loading …'}
									isSecondaryLevel={collection?.metadata?.some(
										(tag) => tag.type === 'Secondary',
									)}
								>
									{!!collection ? collection!.displayName : 'Loading …'}
									<CollectionConfigContainer>
										{oc(collection).metadata[0].type() ? (
											<CollectionConfigText>
												<CollectionConfigTextPipe> | </CollectionConfigTextPipe>
												{oc(collection).metadata[0].type()}
											</CollectionConfigText>
										) : null}
										{collection?.suppressImages ? (
											<CollectionConfigText>
												<CollectionConfigTextPipe> | </CollectionConfigTextPipe>
												Images suppressed
											</CollectionConfigText>
										) : null}
										{collection &&
										collection.platform &&
										collection.platform !== 'Any' ? (
											<CollectionConfigText>
												<CollectionConfigTextPipe> | </CollectionConfigTextPipe>
												{`${collection.platform} Only`}
											</CollectionConfigText>
										) : null}
										{targetedTerritory && (
											<TargetedTerritoryBox>
												{targetedTerritory}
												<span> &nbsp;ONLY</span>
											</TargetedTerritoryBox>
										)}
									</CollectionConfigContainer>
								</CollectionHeadingText>
							)}
						</CollectionHeadlineWithConfigContainer>
						{isFeast ? this.dropDownMenu(collection) : undefined}
						{isLocked ? (
							<LockedCollectionFlag>Locked</LockedCollectionFlag>
						) : headlineContent ? (
							<HeadlineContentContainer>
								{headlineContent}
								{isEditions && !isFeast && (
									<HeadlineContentButton
										priority="default"
										onClick={this.startRenameContainer}
										title="Rename this container in this issue."
									>
										Rename
									</HeadlineContentButton>
								)}
							</HeadlineContentContainer>
						) : null}
					</CollectionHeadingInner>
					{isFeast ? (
						<DragToConvertFeastCollection sourceContainerId={id} />
					) : undefined}
				</CollectionHeadingSticky>
				<DragIntentContainer
					delay={300}
					onIntentConfirm={this.toggleVisibility}
					onDragIntentStart={() => {
						this.setState({ hasDragOpenIntent: true });
					}}
					onDragIntentEnd={() => {
						this.setState({ hasDragOpenIntent: false });
					}}
					active={!this.props.isOpen}
				>
					<CollectionMetaContainer onClick={this.toggleVisibility}>
						<ItemCountMeta>
							{collection && (
								<>
									<strong>{itemCount}</strong>
									<br />
									{itemCount === 1 ? 'item' : 'items'}
								</>
							)}
						</ItemCountMeta>
						<CollectionMeta>
							<div>
								<strong>
									{collection &&
										collection.lastUpdated &&
										`${upperFirst(
											distanceFromNow(collection.lastUpdated),
										)} ago`}
								</strong>
							</div>
							<div>{collection && collection.updatedBy}</div>
							<CollectionShortVerticalPinline />
						</CollectionMeta>
						{metaContent && (
							<CollectionMeta>
								{metaContent}
								<CollectionShortVerticalPinline />
							</CollectionMeta>
						)}
						<CollectionToggleContainer>
							<ButtonCircularCaret
								active={this.props.isOpen!}
								preActive={this.state.hasDragOpenIntent}
								tabIndex={-1}
							/>
						</CollectionToggleContainer>
					</CollectionMetaContainer>
				</DragIntentContainer>
				{this.props.isOpen && <FadeIn>{children}</FadeIn>}
				{isUneditable ? (
					<CollectionDisabledTheme className="DisabledTheme" />
				) : null}
			</CollectionContainer>
		);
	}

	private getDisplayName = () => {
		const { collection } = this.props;
		return !!collection ? collection!.displayName : 'Loading...';
	};

	private startRenameContainer = () => {
		this.setState({
			displayName: this.getDisplayName(),
			editingContainerName: true,
		});
	};

	private setName = () => {
		const { collection } = this.props;
		collection!.displayName = this.state.displayName;
		this.setState({
			editingContainerName: false,
		});
		this.props.updateCollection(collection!, true, false);
	};

	private removeFrontCollection = () => {
		this.props.removeFrontCollection(this.props.frontId, this.props.id);
	};

	private handleDeleteClick = () => {
		this.setState({ isDeleteClicked: true });
		const isConfirm = window.confirm(
			`Are you sure you wish to delete collection? This cannot be undone.`,
		);
		if (isConfirm) {
			this.removeFrontCollection();
		}
		this.setState({ isDeleteClicked: false });
	};

	private handleUSOnlyOption = () => {
		const { collection } = this.props;
		this.state.isUSOnly = !this.state.isUSOnly;
		if (this.state.isUSOnly) collection.targetedRegions = ['US'];
		else collection.targetedRegions = [];
		this.props.updateCollection(collection!, false, true);
	};
}

const createMapStateToProps = () => {
	const selectCardsInCollection = createSelectCardsInCollection();
	return (state: State, props: ContainerProps) => {
		return {
			collection: collectionSelectors.selectById(state, props.id),
			cardIds: selectCardsInCollection(state, {
				collectionId: props.id,
				collectionSet: props.browsingStage,
				includeSupportingArticles: false,
			}),
			isEditions: isMode(state, 'editions'),
			isFeast: editionsIssueSelectors.selectAll(state)?.platform === 'feast',
		};
	};
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
	handleBlur: () => dispatch(resetFocusState()),
	handleFocus: (collectionId: string) =>
		dispatch(setFocusState({ type: 'collection', collectionId })),
	updateCollection: (
		collection: CollectionType,
		renamingCollection: boolean,
		isMarkedForUSOnly: boolean,
	) => {
		dispatch(
			updateCollectionAction(collection, renamingCollection, isMarkedForUSOnly),
		);
	},
	removeFrontCollection: (frontId: string, id: string) =>
		dispatch(removeFrontCollection(frontId, id)),
});

export default connect(
	createMapStateToProps,
	mapDispatchToProps,
)(CollectionDisplay);
