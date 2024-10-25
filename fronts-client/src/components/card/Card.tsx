import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import Article from 'components/card/article/ArticleCard';
import type { State } from 'types/State';
import { createSelectCardType } from 'selectors/cardSelectors';
import {
	selectCard,
	selectExternalArticleFromCard,
	selectSupportingArticleCount,
} from 'selectors/shared';
import { CardSizes, CardMeta } from 'types/Collection';
import SnapLink from 'components/card/snapLink/SnapLinkCard';
import {
	copyCardImageMetaWithPersist,
	addImageToCard,
	addCardToClipboard,
} from 'actions/Cards';
import {
	dragEventHasImageData,
	getMaybeDimensionsFromWidthAndHeight,
	validateDimensions,
	validateImageEvent,
	validateSlideshowDimensions,
	ValidationResponse,
} from 'util/validateImageSrc';
import {
	editionsCardImageCriteria,
	DRAG_DATA_CARD_IMAGE_OVERRIDE,
	SUPPORT_PORTRAIT_CROPS,
	COLLECTIONS_USING_PORTRAIT_TRAILS,
	landScapeCardImageCriteria,
	portraitCardImageCriteria,
	defaultCardTrailImageCriteria,
	landscape5To4CardImageCriteria,
	COLLECTIONS_USING_LANDSCAPE_5_TO_4_TRAILS,
} from 'constants/image';
import Sublinks from '../FrontsEdit/CollectionComponents/Sublinks';
import {
	selectIsCardFormOpen,
	editorClearCardSelection,
} from 'bundles/frontsUI';
import { bindActionCreators } from 'redux';
import ArticleMetaForm from '../form/ArticleMetaForm';
import { updateCardMetaWithPersistForCollection as updateCardMetaActionForCollection } from 'actions/Cards';
import { updateCardMetaWithPersistForClipboard as updateCardMetaActionForClipboard } from 'actions/Cards';
import { EditMode } from 'types/EditMode';
import { selectEditMode } from 'selectors/pathSelectors';
import { events } from 'services/GA';
import EditModeVisibility from 'components/util/EditModeVisibility';
import { css, styled } from 'constants/theme';
import { getPillarColor } from 'util/getPillarColor';
import { isLive as isArticleLive } from 'util/CAPIUtils';
import { DefaultDropIndicator } from 'components/DropZone';
import DragIntentContainer from 'components/DragIntentContainer';
import { CardTypes, CardTypesMap } from 'constants/cardTypes';
import { RecipeCard } from 'components/card/recipe/RecipeCard';
import { ChefCard } from 'components/card/chef/ChefCard';
import { ChefMetaForm } from '../form/ChefMetaForm';
import { FeastCollectionCard } from './feastCollection/FeastCollectionCard';
import { FeastCollectionMetaForm } from 'components/form/FeastCollectionMetaForm';
import { selectCollectionType } from 'selectors/frontsSelectors';
import { Criteria } from 'types/Grid';
import { Card as CardType } from 'types/Collection';

export const createCardId = (id: string) => `collection-item-${id}`;

const CardContainer = styled('div')<{
	pillarId: string | undefined;
	isLive?: boolean;
	size?: CardSizes;
}>`
	border-top-width: 1px;
	border-top-style: solid;
	border-top-color: ${({ size, pillarId, isLive, theme }) =>
		size !== 'small' && pillarId && isLive
			? getPillarColor(pillarId, isLive)
			: theme.base.colors.borderColor};
`;

const DropzoneStyling = styled.div<{
	isDraggingCardOver?: boolean;
}>`
	${({ isDraggingCardOver }) =>
		isDraggingCardOver &&
		css`
			${DefaultDropIndicator} {
				opacity: 1;
			}
		`}
`;

interface ContainerProps {
	uuid: string;
	frontId: string;
	collectionId?: string;
	children?: React.ReactNode;
	getNodeProps: () => object;
	onSelect: (uuid: string) => void;
	onDelete: () => void;
	parentId: string;
	size?: CardSizes;
	textSize?: CardSizes;
	isUneditable?: boolean;
	showMeta?: boolean;
	isSupporting?: boolean;
	canDragImage?: boolean;
	canShowPageViewData: boolean;
}

type CardContainerProps = ContainerProps & {
	onAddToClipboard: (uuid: string) => void;
	copyCardImageMeta: (from: string, to: string) => void;
	addImageToCard: (id: string, response: ValidationResponse) => void;
	updateCardMetaForCollection: (id: string, meta: CardMeta) => void;
	updateCardMetaForClipboard: (id: string, meta: CardMeta) => void;
	clearCardSelection: (id: string) => void;
	type?: CardTypes;
	isSelected: boolean;
	numSupportingArticles: number;
	editMode: EditMode;
	isLive?: boolean;
	pillarId?: string;
	collectionType?: string;
	selectOtherCard: { (uuid: string): CardType };
	groupSizeId?: number;
};

class Card extends React.Component<CardContainerProps> {
	public state = {
		showCardSublinks: false,
		isDraggingCardOver: false,
	};

	public toggleShowArticleSublinks = (e?: React.MouseEvent) => {
		const togPos = !this.state.showCardSublinks;
		this.setState({ showCardSublinks: togPos });
		if (e) {
			e.stopPropagation();
		}
	};

	public render() {
		const {
			uuid,
			isSelected,
			isSupporting = false,
			children,
			getNodeProps,
			onSelect,
			type,
			size = 'default',
			textSize,
			isUneditable,
			numSupportingArticles,
			updateCardMetaForCollection,
			updateCardMetaForClipboard,
			clearCardSelection,
			parentId,
			showMeta,
			frontId,
			collectionId,
			canDragImage,
			canShowPageViewData = false,
			isLive,
			pillarId,
			collectionType,
			groupSizeId,
		} = this.props;

		const getSublinks = (
			<Sublinks
				numSupportingArticles={numSupportingArticles}
				toggleShowArticleSublinks={this.toggleShowArticleSublinks}
				showArticleSublinks={this.state.showCardSublinks}
				parentId={parentId}
			/>
		);

		const getCard = () => {
			switch (type) {
				case CardTypesMap.ARTICLE:
					return (
						<Article
							frontId={frontId}
							collectionId={collectionId}
							id={uuid}
							isUneditable={isUneditable}
							{...getNodeProps()}
							onDelete={this.onDelete}
							onAddToClipboard={this.handleAddToClipboard}
							onClick={isUneditable ? undefined : () => onSelect(uuid)}
							size={size}
							textSize={textSize}
							showMeta={showMeta}
							onImageDrop={this.handleImageDrop}
							canDragImage={canDragImage}
							canShowPageViewData={canShowPageViewData}
							imageCriteria={this.determineCardCriteria()}
							collectionType={collectionType}
						>
							<EditModeVisibility visibleMode="fronts">
								{getSublinks}
								{/* If there are no supporting articles, the children still need to be rendered, because the dropzone is a child  */}
								{numSupportingArticles === 0
									? children
									: this.state.showCardSublinks && children}
							</EditModeVisibility>
						</Article>
					);
				case CardTypesMap.SNAP_LINK:
					return (
						<>
							<SnapLink
								frontId={frontId}
								collectionId={collectionId}
								id={uuid}
								isUneditable={isUneditable}
								{...getNodeProps()}
								onDelete={this.onDelete}
								onAddToClipboard={this.handleAddToClipboard}
								onClick={isUneditable ? undefined : () => onSelect(uuid)}
								size={size}
								textSize={textSize}
								showMeta={showMeta}
								canShowPageViewData={canShowPageViewData}
							/>
							{getSublinks}
							{numSupportingArticles === 0
								? children
								: this.state.showCardSublinks && children}
						</>
					);
				case CardTypesMap.RECIPE:
					return (
						<>
							<RecipeCard
								frontId={frontId}
								collectionId={collectionId}
								id={uuid}
								isUneditable={isUneditable}
								{...getNodeProps()}
								onDelete={this.onDelete}
								onAddToClipboard={this.handleAddToClipboard}
								/* No need for an OnClick here - there are no editable forms */
								size={size}
								textSize={textSize}
								showMeta={showMeta}
							/>
							{getSublinks}
						</>
					);
				case CardTypesMap.CHEF:
					return (
						<>
							<ChefCard
								frontId={frontId}
								collectionId={collectionId}
								id={uuid}
								isUneditable={isUneditable}
								{...getNodeProps()}
								onDelete={this.onDelete}
								onAddToClipboard={this.handleAddToClipboard}
								// Chef has overrides so we need to edit it
								onClick={isUneditable ? undefined : () => onSelect(uuid)}
								size={size}
								textSize={textSize}
								showMeta={showMeta}
							/>
						</>
					);
				case CardTypesMap.FEAST_COLLECTION:
					return (
						<>
							<FeastCollectionCard
								frontId={frontId}
								collectionId={collectionId}
								id={uuid}
								isUneditable={isUneditable}
								{...getNodeProps()}
								onDelete={this.onDelete}
								onAddToClipboard={this.handleAddToClipboard}
								onClick={isUneditable ? undefined : () => onSelect(uuid)}
								size={size}
								textSize={textSize}
								showMeta={showMeta}
							/>
							<Sublinks
								numSupportingArticles={numSupportingArticles}
								toggleShowArticleSublinks={this.toggleShowArticleSublinks}
								showArticleSublinks={this.state.showCardSublinks}
								parentId={parentId}
								sublinkLabel="recipe"
							/>
							{/* If there are no supporting articles, the children still need to be rendered, because the dropzone is a child  */}
							{numSupportingArticles === 0
								? children
								: this.state.showCardSublinks && children}
						</>
					);
				default:
					return (
						<p>
							Item with id {uuid} has unknown card type {type}
						</p>
					);
			}
		};

		const getCardForm = () => {
			switch (type) {
				case CardTypesMap.CHEF:
					return (
						<ChefMetaForm
							cardId={uuid}
							key={uuid}
							form={uuid}
							onSave={(meta) => {
								updateCardMetaForCollection(uuid, meta);
								//todo - save data to clipboard as well a workaround to fix have persistent data even on page revisit,
								// this needs proper testing when making frequent calls to dynamo for setting FeastClipboard field on edit,
								// might need to check in future how to split these actions for editing meta on collection or editing meta on clipboard
								updateCardMetaForClipboard(uuid, meta);
								clearCardSelection(uuid);
							}}
							onCancel={() => clearCardSelection(uuid)}
							size={size}
						/>
					);
				case CardTypesMap.FEAST_COLLECTION:
					return (
						<FeastCollectionMetaForm
							cardId={uuid}
							key={uuid}
							form={uuid}
							onSave={(meta) => {
								updateCardMetaForCollection(uuid, meta);
								updateCardMetaForClipboard(uuid, meta);
								clearCardSelection(uuid);
							}}
							onCancel={() => clearCardSelection(uuid)}
							size={size}
						/>
					);
				default:
					return (
						<ArticleMetaForm
							cardId={uuid}
							isSupporting={isSupporting}
							key={uuid}
							form={uuid}
							frontId={frontId}
							onSave={(meta) => {
								updateCardMetaForCollection(uuid, meta);
								updateCardMetaForClipboard(uuid, meta);
								clearCardSelection(uuid);
							}}
							onCancel={() => clearCardSelection(uuid)}
							size={size}
							groupSizeId={groupSizeId}
						/>
					);
			}
		};

		const supportsForm = type !== 'recipe';
		const shouldDisplayForm = isSelected && supportsForm;

		return (
			<CardContainer
				id={createCardId(uuid)}
				size={size}
				isLive={isLive}
				pillarId={pillarId}
			>
				{shouldDisplayForm ? (
					<>
						{getCardForm()}
						{getSublinks}
						{numSupportingArticles === 0
							? children
							: this.state.showCardSublinks && children}
					</>
				) : (
					<DragIntentContainer
						filterRegisterEvent={(e) => !dragEventHasImageData(e)}
						onDragIntentStart={() => this.setIsDraggingCardOver(true)}
						onDragIntentEnd={() => this.setIsDraggingCardOver(false)}
					>
						<DropzoneStyling isDraggingCardOver={this.state.isDraggingCardOver}>
							{getCard()}
						</DropzoneStyling>
					</DragIntentContainer>
				)}
			</CardContainer>
		);
	}

	public setIsDraggingCardOver = (isDraggingCardOver: boolean) =>
		this.setState({ isDraggingCardOver });

	private handleAddToClipboard = () => {
		this.props.onAddToClipboard(this.props.uuid);
	};

	private onDelete = () => {
		this.props.onDelete();
	};

	private handleImageDrop = (e: React.DragEvent<HTMLElement>) => {
		events.imageAdded(this.props.frontId, 'drop-into-card');
		e.preventDefault();
		e.persist();

		const isEditionsMode = this.props.editMode === 'editions';
		const imageCriteria = isEditionsMode
			? editionsCardImageCriteria
			: this.determineCardCriteria();

		// Our drag is a copy event, from another Card
		const cardUuid = e.dataTransfer.getData(DRAG_DATA_CARD_IMAGE_OVERRIDE);
		if (cardUuid) {
			if (!isEditionsMode) {
				// check dragged image matches this card's collection's criteria.
				const validationForDraggedImage = this.checkDraggedImage(
					cardUuid,
					imageCriteria,
				);
				if (!validationForDraggedImage.matchesCriteria) {
					// @todo - if they don't match, check grid for a matching
					// crop of the image and use that if present?
					// @todo handle error
					alert(
						`Cannot copy that image to this card: ${validationForDraggedImage.reason}`,
					);
					return;
				}
			}

			this.props.copyCardImageMeta(cardUuid, this.props.uuid);
			return;
		}

		// Our drag contains Grid data
		validateImageEvent(e, this.props.frontId, imageCriteria)
			.then((imageData) =>
				this.props.addImageToCard(this.props.uuid, imageData),
			)
			.catch(alert);
	};

	private determineCardCriteria = (): Criteria => {
		const { collectionType, parentId } = this.props;
		// @todo - how best to handle crop drags to a clipboard card?
		// Using the default (landscape) for now.
		// But, if you set a replacement (lanscape) trail on a clipboard
		// item, that item can't be dragged to a portrit collection.
		// Ideally, handleImageDrop will check if the Image has a matching
		// crop of the required criteria and use that instead of the crop
		// being dragged (or the crop on the card being dragged) onto the card
		if (parentId === 'clipboard') {
			return defaultCardTrailImageCriteria;
		}

		if (!collectionType) {
			return landScapeCardImageCriteria;
		}

		if (COLLECTIONS_USING_LANDSCAPE_5_TO_4_TRAILS.includes(collectionType)) {
			return landscape5To4CardImageCriteria;
		}

		if (!SUPPORT_PORTRAIT_CROPS) {
			return landScapeCardImageCriteria;
		}

		return COLLECTIONS_USING_PORTRAIT_TRAILS.includes(collectionType)
			? portraitCardImageCriteria
			: landScapeCardImageCriteria;
	};

	private checkDraggedImage = (
		cardUuid: string,
		imageCriteria: Criteria,
	): ReturnType<typeof validateDimensions> => {
		// check dragged image matches this card's collection's criteria.
		const cardImageWasDraggedFrom = this.props.selectOtherCard(cardUuid);

		const { imageSlideshowReplace, slideshow } = cardImageWasDraggedFrom.meta;
		if (imageSlideshowReplace) {
			return validateSlideshowDimensions(slideshow, imageCriteria);
		}

		const draggedImageDims = getMaybeDimensionsFromWidthAndHeight(
			cardImageWasDraggedFrom?.meta?.imageSrcWidth,
			cardImageWasDraggedFrom?.meta?.imageSrcHeight,
		);

		if (!draggedImageDims) {
			return {
				matchesCriteria: false,
				reason: 'no replacement image found',
			};
		}
		return validateDimensions(draggedImageDims, imageCriteria);
	};
}

const createMapStateToProps = () => {
	const selectType = createSelectCardType();
	return (state: State, { uuid, frontId, collectionId }: ContainerProps) => {
		const maybeExternalArticle = selectExternalArticleFromCard(state, uuid);
		return {
			type: selectType(state, uuid),
			isSelected: selectIsCardFormOpen(state, uuid, frontId),
			isLive: maybeExternalArticle && isArticleLive(maybeExternalArticle),
			pillarId: maybeExternalArticle && maybeExternalArticle.pillarId,
			numSupportingArticles: selectSupportingArticleCount(state, uuid),
			editMode: selectEditMode(state),
			collectionType: collectionId && selectCollectionType(state, collectionId),
			selectOtherCard: (uuid: string) => selectCard(state, uuid),
		};
	};
};

const mapDispatchToProps = (dispatch: Dispatch) => {
	return bindActionCreators(
		{
			onAddToClipboard: addCardToClipboard,
			copyCardImageMeta: copyCardImageMetaWithPersist,
			addImageToCard,
			updateCardMetaForCollection: updateCardMetaActionForCollection,
			updateCardMetaForClipboard: updateCardMetaActionForClipboard,
			clearCardSelection: editorClearCardSelection,
		},
		dispatch,
	);
};

export default connect(createMapStateToProps, mapDispatchToProps)(Card);
