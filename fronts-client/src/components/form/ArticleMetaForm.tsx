import React, { SyntheticEvent } from 'react';
import { connect } from 'react-redux';
import {
	reduxForm,
	InjectedFormProps,
	formValueSelector,
	Field,
	EventWithDataHandler,
	WrappedFieldArrayProps,
	FieldArray,
} from 'redux-form';
import { styled, theme } from 'constants/theme';
import Button from 'components/inputs/ButtonDefault';
import {
	createSelectArticleFromCard,
	selectExternalArticleFromCard,
	selectArticleTag,
} from 'selectors/shared';
import { createSelectFormFieldsForCard } from 'selectors/formSelectors';
import { defaultObject } from 'util/selectorUtils';
import { CardMeta, ArticleTag, CardSizes, ImageData } from 'types/Collection';
import InputText from 'components/inputs/InputText';
import InputTextArea from 'components/inputs/InputTextArea';
import InputCheckboxToggleInline from 'components/inputs/InputCheckboxToggleInline';
import InputImage from 'components/inputs/InputImage';
import InputGroup from 'components/inputs/InputGroup';
import InputButton from 'components/inputs/InputButton';
import Row from '../Row';
import Col from '../Col';
import type { State } from 'types/State';
import ConditionalField from 'components/inputs/ConditionalField';
import ConditionalComponent from 'components/layout/ConditionalComponent';
import {
	CardFormData,
	getCardMetaFromFormValues,
	getInitialValuesForCardForm,
	getCapiValuesForArticleFields,
	shouldRenderField,
	maxSlideshowImages,
} from 'util/form';
import { CapiFields } from 'util/form';
import { Dispatch } from 'types/Store';
import {
	landScapeCardImageCriteria,
	editionsCardImageCriteria,
	editionsMobileCardImageCriteria,
	editionsTabletCardImageCriteria,
	portraitCardImageCriteria,
	COLLECTIONS_USING_PORTRAIT_TRAILS,
	COLLECTIONS_USING_LANDSCAPE_5_TO_4_TRAILS,
	landscape5To4CardImageCriteria,
	COLLECTIONS_USING_SQUARE_TRAILS,
	squareImageCriteria,
} from 'constants/image';
import { selectors as collectionSelectors } from 'bundles/collectionsBundle';
import { getContributorImage } from 'util/CAPIUtils';
import { EditMode } from 'types/EditMode';
import { selectEditMode, selectV2SubPath } from 'selectors/pathSelectors';
import { ValidationResponse } from 'util/validateImageSrc';
import InputLabel from 'components/inputs/InputLabel';
import url from 'constants/url';
import { RichTextInput } from 'components/inputs/RichTextInput';
import InputBase from '../inputs/InputBase';
import ButtonCircularCaret from '../inputs/ButtonCircularCaret';
import { error } from '../../styleConstants';
import { WarningIcon } from '../icons/Icons';
import { FormContainer } from 'components/form/FormContainer';
import { FormContent } from 'components/form/FormContent';
import { TextOptionsInputGroup } from 'components/form/TextOptionsInputGroup';
import { FormButtonContainer } from 'components/form/FormButtonContainer';
import { selectCollectionType } from 'selectors/frontsSelectors';
import { Criteria } from 'types/Grid';
import { ImageOptionsInputGroup } from './ImageOptionsInputGroup';
import { RowContainer } from './RowContainer';
import { ImageRowContainer } from './ImageRowContainer';
import { ImageCol } from './ImageCol';
import InputRadio from 'components/inputs/InputRadio';
import {
	FLEXIBLE_GENERAL_NAME,
	FLEXIBLE_SPECIAL_NAME,
} from 'constants/flexibleContainers';

interface ComponentProps extends ContainerProps {
	articleExists: boolean;
	collectionId: string | null;
	getLastUpdatedBy: (id: string) => string | null;
	cardId: string;
	showKickerTag: boolean;
	showKickerSection: boolean;
	pickedKicker: string | undefined;
	kickerOptions: ArticleTag;
	cutoutImage?: string;
	primaryImage: ValidationResponse | null;
	coverCardImageReplace?: boolean;
	coverCardMobileImage?: ImageData;
	coverCardTabletImage?: ImageData;
	size?: string;
	isEmailFronts?: boolean;
	collectionType?: string;
}

type Props = ComponentProps &
	InterfaceProps &
	InjectedFormProps<CardFormData, ComponentProps & InterfaceProps, {}>;

type RenderSlideshowProps = WrappedFieldArrayProps<ImageData> & {
	frontId: string;
	change: (field: string, value: any) => void;
	slideshowHasAtLeastTwoImages: boolean;
	criteria: Criteria;
};

const SlideshowRowContainer = styled(RowContainer)`
	flex: 1 1 auto;
	overflow: visible;
	margin-top: 4px;
	margin-left: ${(props: { size?: string }) =>
		props.size !== 'wide' ? 0 : '10px'};
`;

const slideshowGutter = 5;
const slidesPerRow = 5;

const SlideshowRow = styled(Row)`
	flex-wrap: wrap;
	margin-left: 0;
	margin-right: 0;
	margin-top: 10px;
	margin-bottom: 5px;
	gap: ${slideshowGutter}px;
`;

const SlideshowCol = styled(Col)`
	flex: 0 1 auto;
	padding: 0;
	width: calc(${100 / slidesPerRow}% - ${slideshowGutter}px);
	max-width: 100px;
`;

const SlideshowLabel = styled.div`
	font-size: 12px;
	color: ${theme.colors.greyMedium};
	margin-bottom: 12px;
`;

const CollectionEditedError = styled.div`
	background-color: yellow;
	margin-bottom: 1em;
	padding: 1em;
`;

const FieldsContainerWrap = styled(Row)`
	flex-wrap: wrap;
	padding-bottom: 4px;
	border-bottom: 1px solid ${theme.base.colors.borderColor};
	${(props: { extraBottomMargin?: string }) =>
		props.extraBottomMargin
			? `margin-bottom: ${props.extraBottomMargin};`
			: null}
`;

const ToggleCol = styled(Col)`
	margin-top: 24px;
`;

const CaptionControls = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 4px;
`;

const CaptionLength = styled.span`
 font-size: 12px;
 margin-left: 2px;
 color: ${(props: { invalid: boolean }) =>
		props.invalid ? error.primary : 'default'}}
`;

const CaptionLabel = styled(InputLabel)`
	margin: 0 5px 0 5px;
`;

const CaptionInput = styled(InputBase)`
  margin-bottom: 60px;
  color: ${(props: { invalid: boolean }) =>
		props.invalid ? error.primary : 'default'}}
  border-color: ${(props: { invalid: boolean }) =>
		props.invalid ? error.primary : 'default'}
  :focus {
    border-color: ${(props: { invalid: boolean }) =>
			props.invalid ? error.primary : 'default'}
  }
`;

const FlexContainer = styled.div`
	display: flex;
	align-items: center;
`;

const InvalidSlideshowWarning = styled(FlexContainer)`
	margin-top: 4px;
`;

const InvalidSlideshowText = styled.div`
	color: ${error.primary};
	font-size: 12px;
	margin-left: 4px;
`;

const maxCaptionLength = (max: number) => (value: ImageData) =>
	value && (value.caption?.length ?? 0) > max
		? `Must be ${max} characters or less`
		: undefined;

const maxLength100 = maxCaptionLength(100);

const RenderSlideshow = ({
	fields,
	frontId,
	change,
	slideshowHasAtLeastTwoImages,
	criteria,
}: RenderSlideshowProps) => {
	const [slideshowIndex, setSlideshowIndex] = React.useState(0);

	React.useEffect(() => {
		if (!fields.get(slideshowIndex)) {
			navigateToNearestIndex();
		}
	}, [fields.get(slideshowIndex)]);

	const isInvalidCaptionLength = (index: number) =>
		!!maxLength100(fields.get(index));

	const navigateToNearestIndex = () => {
		if (handleNavigation(true)()) {
			return handleNavigation(true, true)();
		}

		if (handleNavigation(false)()) {
			return handleNavigation(false, true)();
		}

		return setSlideshowIndex(-1);
	};

	// Determines whether we can navigate to the next index, and optionally navigates to that index
	const handleNavigation =
		(isForwards: boolean = true, shouldNavigate: boolean = false) =>
		() => {
			const incrementValue = isForwards ? 1 : -1;

			for (
				let i = slideshowIndex + incrementValue;
				i < fields.length && i >= 0;
				i = i + incrementValue
			) {
				if (fields.get(i)) {
					if (shouldNavigate) {
						setSlideshowIndex(i);
					}
					return true;
				}
			}

			return false;
		};

	return (
		<>
			<SlideshowRow>
				{fields.map((name, index) => (
					<SlideshowCol
						key={`${name}-${index}`}
						onClick={() => setSlideshowIndex(index)}
					>
						<Field
							name={name}
							component={InputImage}
							small
							criteria={criteria}
							frontId={frontId}
							isSelected={index === slideshowIndex}
							isInvalid={isInvalidCaptionLength(index)}
							validate={[maxLength100]}
						/>
					</SlideshowCol>
				))}
			</SlideshowRow>
			<SlideshowLabel>
				Drag and drop up to {maxSlideshowImages} images
			</SlideshowLabel>
			{fields.get(slideshowIndex) ? (
				<div>
					<CaptionControls>
						<div>
							<ButtonCircularCaret
								clear
								openDir="left"
								type="button"
								disabled={!handleNavigation(false)()}
								onClick={handleNavigation(false, true)}
							/>

							<CaptionLabel>
								Caption {slideshowIndex + 1}/{fields.length}
							</CaptionLabel>

							<ButtonCircularCaret
								clear
								openDir="right"
								type="button"
								disabled={!handleNavigation(true)()}
								onClick={handleNavigation(true, true)}
							/>
						</div>

						<FlexContainer>
							{isInvalidCaptionLength(slideshowIndex) ? (
								<WarningIcon size="s" fill={error.warningDark} />
							) : null}
							<CaptionLength invalid={isInvalidCaptionLength(slideshowIndex)}>
								{fields.get(slideshowIndex)?.caption?.length ?? 0} / 100
							</CaptionLength>
						</FlexContainer>
					</CaptionControls>
					<CaptionInput
						type="text"
						value={fields.get(slideshowIndex).caption ?? ''}
						invalid={isInvalidCaptionLength(slideshowIndex)}
						onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
							change(`slideshow[${slideshowIndex}].caption`, event.target.value)
						}
					/>
				</div>
			) : null}
			{!slideshowHasAtLeastTwoImages ? (
				<InvalidSlideshowWarning>
					<WarningIcon size="s" fill={error.warningDark} />
					<InvalidSlideshowText>
						You need at least two images to make a slideshow
					</InvalidSlideshowText>
				</InvalidSlideshowWarning>
			) : null}
		</>
	);
};

const CheckboxFieldsContainer: React.SFC<{
	children: Array<React.ReactElement<{
		name: string;
		type?: string;
		value?: string;
	}> | null>;
	editableFields: string[];
	size?: string;
	extraBottomMargin?: string;
}> = ({ children, editableFields, size, extraBottomMargin }) => {
	const childrenToRender = children.filter(
		(child) =>
			child !== null && shouldRenderField(child.props.name, editableFields),
	);
	if (!childrenToRender.length) {
		return null;
	}
	return (
		<FieldsContainerWrap extraBottomMargin={extraBottomMargin}>
			{childrenToRender.map((child) => {
				const key =
					child?.props.type && child?.props.type === 'radio'
						? `${child?.props.name}-${child?.props.value}`
						: child?.props.name;
				return (
					<FieldContainer key={key} size={size}>
						{child}
					</FieldContainer>
				);
			})}
		</FieldsContainerWrap>
	);
};

const FieldContainer = styled(Col)`
	flex: ${(props: { size?: string }) =>
		props.size === 'wide' ? '0 0 auto' : 1};
	margin-bottom: 8px;
	white-space: nowrap;
	& label {
		padding-left: 3px;
		padding-right: 5px;
	}
`;

const KickerSuggestionsContainer = styled.div`
	flex-wrap: wrap;
	justify-content: flex-end;
	padding-left: 5px;
	display: flex;
	margin-left: auto;
	font-size: 12px;
	font-weight: normal;
`;
const CardReplacementWarning = styled.div`
	color: red;
`;

const KickerSuggestionButton = styled(InputButton)`
	background: transparent;
	border: 1px solid ${theme.colors.greyMediumLight};
	color: ${theme.colors.blackDark};
	&:hover:enabled {
		background-color: ${theme.colors.greyLight};
	}
`;

const getInputId = (cardId: string, label: string) => `${cardId}-${label}`;

interface FormComponentState {
	lastKnownCollectionId: string | null;
}

class FormComponent extends React.Component<Props, FormComponentState> {
	public static getDerivedStateFromProps(props: Props) {
		return props.collectionId
			? { lastKnownCollectionId: props.collectionId }
			: {};
	}

	public state: FormComponentState = {
		lastKnownCollectionId: null,
	};

	public render() {
		const {
			cardId,
			change,
			kickerOptions,
			pickedKicker,
			imageHide,
			articleCapiFieldValues,
			pristine,
			showByline,
			editableFields = [],
			showKickerTag,
			showKickerSection,
			frontId,
			articleExists,
			imageReplace,
			imageCutoutReplace,
			cutoutImage,
			imageSlideshowReplace,
			slideshow,
			isBreaking,
			editMode,
			primaryImage,
			hasMainVideo,
			coverCardImageReplace,
			coverCardMobileImage,
			coverCardTabletImage,
			valid,
			collectionType,
			groupSizeId,
		} = this.props;

		const isEditionsMode = editMode === 'editions';

		const imageDefined = (img: ImageData | undefined) => img && img.src;

		const slideshowHasAtLeastTwoImages =
			(slideshow ?? []).filter((field) => !!field).length >= 2;

		const invalidCardReplacement = coverCardImageReplace
			? !imageDefined(coverCardMobileImage) ||
				!imageDefined(coverCardTabletImage)
			: false;

		const setCustomKicker = (customKickerValue: string) => {
			change('customKicker', customKickerValue);
			change('showKickerCustom', true);

			// kicker suggestions now set the value of `customKicker` rather than set a flag
			// set the old flags to false
			['showKickerTag', 'showKickerSection'].forEach((field) =>
				change(field, false),
			);
		};

		const renderKickerSuggestion = (
			value: string,
			index: number,
			array: string[],
		) => (
			<Field
				name={'kickerSuggestion' + value}
				key={'kickerSuggestion' + value}
				component={KickerSuggestionButton}
				buttonText={value}
				size="s"
				onClick={() => setCustomKicker(value)}
			/>
		);

		const getKickerContents = () => {
			const uniqueKickerSuggestions = [
				...new Set([
					pickedKicker || '',
					kickerOptions.webTitle || '',
					kickerOptions.sectionName || '',
				]),
			];
			return (
				<>
					<span>Suggested:&nbsp;</span>
					{uniqueKickerSuggestions
						.filter((value) => !!value)
						.map(renderKickerSuggestion)}
					<span>&nbsp;&nbsp;&nbsp;</span>
					<Field
						name={'clearKickerSuggestion'}
						key={'clearKickerSuggestion'}
						component={KickerSuggestionButton}
						buttonText={'Clear'}
						style={{ fontStyle: 'italic' }}
						size="s"
						onClick={() => setCustomKicker('')}
					/>
				</>
			);
		};

		const allowGigaBoost = () =>
			!collectionType /* clipboard */ ||
			(collectionType &&
				(collectionType === FLEXIBLE_SPECIAL_NAME /* flexible special */ ||
					(collectionType ===
						FLEXIBLE_GENERAL_NAME /* splash group in flexible general */ &&
						groupSizeId &&
						groupSizeId > 0)));

		const cardCriteria = this.determineCardCriteria();

		return (
			<FormContainer
				data-testid="edit-form"
				topBorder={false}
				onClick={
					(e: React.MouseEvent) =>
						e.stopPropagation() /* Prevent clicks passing through the form */
				}
			>
				{!articleExists && (
					<CollectionEditedError>
						{this.state.lastKnownCollectionId &&
							`This collection has been edited by ${this.props.getLastUpdatedBy(
								this.state.lastKnownCollectionId,
							)} since you started editing this article. Your changes have not been saved.`}
					</CollectionEditedError>
				)}
				<FormContent size={this.props.size}>
					<TextOptionsInputGroup>
						<ConditionalField
							name="customKicker"
							label="Kicker"
							permittedFields={editableFields}
							component={InputText}
							disabled={isBreaking}
							title={
								isBreaking
									? "You cannot edit the kicker if the 'Breaking News' toggle is set."
									: ''
							}
							labelContent={
								<KickerSuggestionsContainer>
									{getKickerContents()}
								</KickerSuggestionsContainer>
							}
							placeholder="Add custom kicker"
							format={(value: string) => {
								if (showKickerTag) {
									return kickerOptions.webTitle;
								}
								if (showKickerSection) {
									return kickerOptions.sectionName;
								}
								return value;
							}}
							onChange={(e: React.ChangeEvent<any>) => {
								if (e) {
									setCustomKicker(e.target.value);
								}
							}}
						/>
						{shouldRenderField('headline', editableFields) && (
							<Field
								name="headline"
								label={this.getHeadlineLabel()}
								rows="2"
								placeholder={articleCapiFieldValues.headline}
								component={
									this.props.snapType === 'html' ? RichTextInput : InputTextArea
								}
								originalValue={articleCapiFieldValues.headline}
								data-testid="edit-form-headline-field"
							/>
						)}
						<CheckboxFieldsContainer
							editableFields={editableFields}
							size={this.props.size}
							extraBottomMargin="8px"
						>
							<Field
								name="boostLevel"
								component={InputRadio}
								label="Default"
								id={getInputId(cardId, 'boostlevel-0')}
								value="default"
								type="radio"
							/>
							<Field
								name="boostLevel"
								component={InputRadio}
								label="Boost"
								id={getInputId(cardId, 'boostlevel-1')}
								value="boost"
								type="radio"
							/>
							<Field
								name="boostLevel"
								component={InputRadio}
								label="Mega Boost"
								id={getInputId(cardId, 'boostlevel-2')}
								value="megaboost"
								type="radio"
							/>
							{allowGigaBoost() ? (
								<Field
									name="boostLevel"
									component={InputRadio}
									label="Giga Boost"
									id={getInputId(cardId, 'boostlevel-3')}
									value="gigaboost"
									type="radio"
								/>
							) : null}
						</CheckboxFieldsContainer>
						<CheckboxFieldsContainer
							editableFields={editableFields}
							size={this.props.size}
						>
							<Field
								name="isBoosted"
								component={InputCheckboxToggleInline}
								label="Boost"
								id={getInputId(cardId, 'boost')}
								type="checkbox"
							/>
							<Field
								name="showLargeHeadline"
								component={InputCheckboxToggleInline}
								label="Large headline"
								id={getInputId(cardId, 'large-headline')}
								type="checkbox"
							/>
							<Field
								name="showQuotedHeadline"
								component={InputCheckboxToggleInline}
								label="Quote headline"
								id={getInputId(cardId, 'quote-headline')}
								type="checkbox"
							/>
							<Field
								name="isBreaking"
								component={InputCheckboxToggleInline}
								label="Breaking News"
								id={getInputId(cardId, 'breaking-news')}
								type="checkbox"
								dataTestId="edit-form-breaking-news-toggle"
							/>
							<Field
								name="showByline"
								component={InputCheckboxToggleInline}
								label="Show Byline"
								id={getInputId(cardId, 'show-byline')}
								type="checkbox"
							/>
							<Field
								name="showLivePlayable"
								component={InputCheckboxToggleInline}
								label="Show updates"
								id={getInputId(cardId, 'show-updates')}
								type="checkbox"
							/>
						</CheckboxFieldsContainer>
						{showByline && (
							<ConditionalField
								permittedFields={editableFields}
								name="byline"
								label="Byline"
								component={InputText}
								placeholder={articleCapiFieldValues.byline}
								useHeadlineFont
								originalValue={articleCapiFieldValues.byline}
							/>
						)}
						<ConditionalField
							permittedFields={editableFields}
							name="trailText"
							component={InputTextArea}
							placeholder={articleCapiFieldValues.trailText}
							originalValue={articleCapiFieldValues.trailText}
							label="Trail text"
						/>
						<ConditionalField
							permittedFields={editableFields}
							name="sportScore"
							label="Sport Score"
							component={InputText}
							placeholder=""
							originalValue={''}
						/>
					</TextOptionsInputGroup>
					<ImageOptionsInputGroup size={this.props.size}>
						<ImageRowContainer size={this.props.size}>
							<Row>
								<ImageCol faded={imageHide || !!coverCardImageReplace}>
									{shouldRenderField(
										this.getImageFieldName(),
										editableFields,
									) && (
										<InputLabel htmlFor={this.getImageFieldName()}>
											Trail image
										</InputLabel>
									)}
									<ConditionalField
										permittedFields={editableFields}
										name={this.getImageFieldName()}
										component={InputImage}
										disabled={imageHide || coverCardImageReplace}
										criteria={
											isEditionsMode ? editionsCardImageCriteria : cardCriteria
										}
										frontId={frontId}
										defaultImageUrl={
											imageCutoutReplace
												? cutoutImage
												: articleCapiFieldValues.thumbnail
										}
										useDefault={!imageCutoutReplace && !imageReplace}
										message={
											imageCutoutReplace ? 'Add cutout' : 'Replace image'
										}
										hasVideo={hasMainVideo}
										onChange={this.handleImageChange}
										collectionType={this.props.collectionType}
									/>
								</ImageCol>
								<ToggleCol flex={2}>
									<InputGroup>
										<ConditionalField
											permittedFields={editableFields}
											name="imageHide"
											component={InputCheckboxToggleInline}
											label="Hide media"
											id={getInputId(cardId, 'hide-media')}
											type="checkbox"
											default={false}
											onChange={() => this.changeImageField('imageHide')}
										/>
									</InputGroup>
									<InputGroup>
										<ConditionalField
											permittedFields={editableFields}
											name="imageCutoutReplace"
											component={InputCheckboxToggleInline}
											label="Use cutout"
											id={getInputId(cardId, 'use-cutout')}
											type="checkbox"
											default={false}
											onChange={() =>
												this.changeImageField('imageCutoutReplace')
											}
										/>
									</InputGroup>
									<InputGroup>
										<ConditionalField
											permittedFields={editableFields}
											name="coverCardImageReplace"
											id={getInputId(cardId, 'coverCardImageReplace')}
											component={InputCheckboxToggleInline}
											label="Replace Cover Card Image"
											type="checkbox"
											default={false}
											onChange={() =>
												this.changeImageField('coverCardImageReplace')
											}
										/>
									</InputGroup>
									<InputGroup>
										<ConditionalField
											permittedFields={editableFields}
											name="showMainVideo"
											component={InputCheckboxToggleInline}
											label="Show video"
											id={getInputId(cardId, 'show-video')}
											type="checkbox"
											onChange={() => this.changeImageField('showMainVideo')}
										/>
									</InputGroup>
									<InputGroup>
										<ConditionalField
											permittedFields={editableFields}
											name="imageSlideshowReplace"
											component={InputCheckboxToggleInline}
											label="Slideshow"
											id={getInputId(cardId, 'slideshow')}
											type="checkbox"
											onChange={() =>
												this.changeImageField('imageSlideshowReplace')
											}
										/>
									</InputGroup>
									{primaryImage && !!primaryImage.src && (
										<InputGroup>
											<ConditionalField
												permittedFields={editableFields}
												name="imageReplace"
												component={InputCheckboxToggleInline}
												label="Use replacement image"
												id={getInputId(cardId, 'image-replace')}
												type="checkbox"
												default={false}
												onChange={() => this.changeImageField('imageReplace')}
											/>
										</InputGroup>
									)}
								</ToggleCol>
							</Row>
							<ConditionalComponent
								permittedNames={editableFields}
								name={['primaryImage', 'imageHide']}
							/>
						</ImageRowContainer>
						{imageSlideshowReplace && (
							<SlideshowRowContainer size={this.props.size}>
								<FieldArray
									name="slideshow"
									frontId={frontId}
									component={RenderSlideshow}
									change={change}
									criteria={cardCriteria}
									slideshowHasAtLeastTwoImages={slideshowHasAtLeastTwoImages}
								/>
							</SlideshowRowContainer>
						)}
					</ImageOptionsInputGroup>
					{isEditionsMode && coverCardImageReplace && (
						<RowContainer>
							<Row>
								<ImageCol faded={!coverCardImageReplace}>
									<InputLabel htmlFor={this.getImageFieldName()}>
										Mobile Cover Card
									</InputLabel>
									<Field
										name="coverCardMobileImage"
										component={InputImage}
										message="Add Mobile Card Image"
										criteria={editionsMobileCardImageCriteria}
										disabled={!coverCardImageReplace}
									/>
								</ImageCol>
								<ImageCol faded={!coverCardImageReplace}>
									<InputLabel htmlFor={this.getImageFieldName()}>
										Tablet Cover Card
									</InputLabel>
									<Field
										name="coverCardTabletImage"
										component={InputImage}
										message="Add Tablet Card Image"
										criteria={editionsTabletCardImageCriteria}
										disabled={!coverCardImageReplace}
									/>
								</ImageCol>
							</Row>
							<Row>
								<Col>
									<a
										href={url.editionsCardBuilder}
										target="_blank"
										rel="noreferrer noopener"
									>
										Open Cover Card Builder
									</a>
								</Col>
							</Row>
							<Row>
								<Col flex={2}>
									{invalidCardReplacement && (
										<CardReplacementWarning>
											You must set both the mobile and tablet card overrides!
										</CardReplacementWarning>
									)}
								</Col>
							</Row>
						</RowContainer>
					)}
				</FormContent>
				{articleCapiFieldValues.urlPath && (
					// the below tag is empty and meaningless to the fronts tool itself, but serves as a handle for
					// Pinboard to attach itself via, identified/distinguished by the urlPath data attribute
					// @ts-ignore
					<pinboard-article-button
						data-url-path={articleCapiFieldValues.urlPath}
						data-with-draggable-thumbs-of-ratio={`${cardCriteria.widthAspectRatio}:${cardCriteria.heightAspectRatio}`}
					/>
				)}
				<FormButtonContainer>
					<Button onClick={this.handleCancel} type="button" size="l">
						Cancel
					</Button>
					<Button
						priority="primary"
						onClick={this.handleSubmit}
						disabled={
							pristine ||
							!articleExists ||
							invalidCardReplacement ||
							!valid ||
							(imageSlideshowReplace && !slideshowHasAtLeastTwoImages)
						}
						size="l"
						data-testid="edit-form-save-button"
					>
						Save
					</Button>
				</FormButtonContainer>
			</FormContainer>
		);
	}

	private handleSubmit = (e: SyntheticEvent<any>) => {
		e.stopPropagation();
		this.props.handleSubmit(e);
	};

	private handleCancel = (e: SyntheticEvent<any>) => {
		e.stopPropagation();
		this.props.onCancel();
	};

	private getImageFieldName = () => {
		if (this.props.imageCutoutReplace) {
			return 'cutoutImage';
		}
		return 'primaryImage';
	};

	private handleImageChange: EventWithDataHandler<React.ChangeEvent<any>> = (
		e: unknown,
		...args: [any?, any?, string?]
	) => {
		// If we don't already have an image override enabled, enable the default imageReplace property.
		// This saves the user a click; adding an image without enabling would be very unusual.
		if (!this.props.imageCutoutReplace && !this.props.imageReplace) {
			this.changeImageField('imageReplace');
		}

		this.props.change(this.getImageFieldName(), e);
	};

	private changeImageField = (fieldToSet: string) => {
		const allImageFields = [
			'imageHide',
			'imageCutoutReplace',
			'imageSlideshowReplace',
			'imageReplace',
			'showMainVideo',
			'coverCardImageReplace',
		];

		allImageFields.forEach((field) => {
			if (field === fieldToSet) {
				this.props.change(field, true);
			} else {
				this.props.change(field, false);
			}
		});
	};

	/**
	 * You may be thinking -- why on earth would we use the `headline` field to contain
	 * HTML, renaming it in the process so our users are none the wiser? It's because the e-mail
	 * frontend, which currently consumes snaps of this type, knows what to do with headlines
	 * (it renders them as HTML). At some point in the future, it will be refactored, at which
	 * point we'll be able to use another, saner field to do the same job, but in the meantime,
	 * for snaps of type `html`, the field `headline` is where the html lives.
	 */
	private getHeadlineLabel = () =>
		this.props.snapType === 'html' ? 'Content' : 'Headline';

	private determineCardCriteria = (): Criteria & {
		widthAspectRatio: number;
		heightAspectRatio: number;
	} => {
		const { collectionType } = this.props;
		if (!collectionType) {
			return landScapeCardImageCriteria;
		}
		if (COLLECTIONS_USING_LANDSCAPE_5_TO_4_TRAILS.includes(collectionType)) {
			return landscape5To4CardImageCriteria;
		}
		if (COLLECTIONS_USING_SQUARE_TRAILS.includes(collectionType)) {
			return squareImageCriteria;
		}
		return COLLECTIONS_USING_PORTRAIT_TRAILS.includes(collectionType)
			? portraitCardImageCriteria
			: landScapeCardImageCriteria;
	};
}

const CardForm = reduxForm<CardFormData, ComponentProps & InterfaceProps, {}>({
	destroyOnUnmount: true,
	onSubmit: (
		values: CardFormData,
		dispatch: Dispatch,
		props: ComponentProps & InterfaceProps,
	) => {
		// By using a thunk, we get access to the application state. We could use
		// mergeProps, or thread state through the component, to achieve the same
		// result -- this seemed to be the most concise way.
		dispatch((_, getState) => {
			const meta: CardMeta = getCardMetaFromFormValues(
				getState(),
				props.cardId,
				values,
			);
			props.onSave(meta);
		});
	},
})(FormComponent);

interface ContainerProps {
	articleExists: boolean;
	collectionId: string | null;
	snapType: string | undefined;
	getLastUpdatedBy: (collectionId: string) => string | null;
	slideshow: Array<ImageData | undefined | null> | undefined;
	imageSlideshowReplace: boolean;
	imageCutoutReplace: boolean;
	imageHide: boolean;
	kickerOptions: ArticleTag;
	pickedKicker: string | undefined;
	showByline: boolean;
	editableFields?: string[];
	showKickerTag: boolean;
	showKickerSection: boolean;
	articleCapiFieldValues: CapiFields;
	imageReplace: boolean;
	isBreaking: boolean;
	editMode: EditMode;
	primaryImage: ValidationResponse | null;
	hasMainVideo: boolean;
}

interface InterfaceProps {
	form: string;
	cardId: string;
	isSupporting?: boolean;
	onCancel: () => void;
	onSave: (meta: CardMeta) => void;
	frontId: string;
	size?: CardSizes;
	groupSizeId?: number;
}

const formContainer: React.SFC<ContainerProps & InterfaceProps> = (props) => (
	<CardForm {...props} />
);

const createMapStateToProps = () => {
	const selectArticle = createSelectArticleFromCard();
	const selectFormFields = createSelectFormFieldsForCard();
	return (state: State, { cardId, isSupporting = false }: InterfaceProps) => {
		const externalArticle = selectExternalArticleFromCard(state, cardId);
		const valueSelector = formValueSelector(cardId);
		const article = selectArticle(state, cardId);
		const parentCollectionId =
			collectionSelectors.selectParentCollectionOfCard(state, cardId) || null;
		const parentCollection = parentCollectionId
			? collectionSelectors.selectById(state, parentCollectionId)
			: null;

		function getLastUpdatedBy(collectionId: string) {
			const collection = collectionSelectors.selectById(state, collectionId);
			if (!collection) {
				return null;
			}
			return collection.updatedBy || null;
		}

		const isEmailFronts = selectV2SubPath(state) === '/email';
		const collectionId = (parentCollection && parentCollection.id) || null;

		return {
			articleExists: !!article,
			hasMainVideo: !!article && !!article.hasMainVideo,
			collectionId,
			getLastUpdatedBy,
			snapType: article && article.snapType,
			initialValues: getInitialValuesForCardForm(article),
			articleCapiFieldValues: getCapiValuesForArticleFields(externalArticle),
			editableFields:
				article && selectFormFields(state, article.uuid, isSupporting),
			kickerOptions: article ? selectArticleTag(state, cardId) : defaultObject,
			imageSlideshowReplace: valueSelector(state, 'imageSlideshowReplace'),
			slideshow: valueSelector(state, 'slideshow'),
			imageHide: valueSelector(state, 'imageHide'),
			imageReplace: valueSelector(state, 'imageReplace'),
			imageCutoutReplace: valueSelector(state, 'imageCutoutReplace'),
			showByline: valueSelector(state, 'showByline'),
			showKickerTag: valueSelector(state, 'showKickerTag'),
			showKickerSection: valueSelector(state, 'showKickerSection'),
			isBreaking: valueSelector(state, 'isBreaking'),
			cutoutImage: externalArticle
				? getContributorImage(externalArticle)
				: undefined,
			editMode: selectEditMode(state),
			primaryImage: valueSelector(state, 'primaryImage'),
			coverCardImageReplace: valueSelector(state, 'coverCardImageReplace'),
			coverCardMobileImage: valueSelector(state, 'coverCardMobileImage'),
			coverCardTabletImage: valueSelector(state, 'coverCardTabletImage'),
			pickedKicker: !!article ? article.pickedKicker : undefined,
			isEmailFronts,
			collectionType: collectionId
				? selectCollectionType(state, collectionId)
				: undefined,
		};
	};
};

export { getCardMetaFromFormValues, getInitialValuesForCardForm };

export default connect<ContainerProps, {}, InterfaceProps, State>(
	createMapStateToProps,
)(formContainer);
