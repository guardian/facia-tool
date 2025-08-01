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
import { SelectVideoIcon, SlideshowIcon, WarningIcon } from '../icons/Icons';
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
import { CollectionToggles, renderBoostToggles } from './BoostToggles';
import { memoize, debounce } from 'lodash';
import InputRadio from '../inputs/InputRadio';
import { VideoControls } from '../video/VideoControls';
import { getMainMediaVideoAtom } from '../../util/externalArticle';
import { selectVideoBaseUrl } from '../../selectors/configSelectors';
import SelectMediaInput from '../inputs/SelectMediaInput';
import SelectMediaLabelContainer from '../inputs/SelectMediaLabelContainer';
import type { Atom, AtomResponse } from '../../types/Capi';
import Tooltip from '../modals/Tooltip';
import { isAtom } from '../../util/atom';

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
		props.invalid ? error.primary : 'default'};
`;

const CaptionLabel = styled(InputLabel)`
	margin: 0 5px 0 5px;
`;

const CaptionInput = styled(InputBase)`
	margin-bottom: 10px;
	color: ${(props: { invalid: boolean }) =>
		props.invalid ? error.primary : 'default'};
	border-color: ${(props: { invalid: boolean }) =>
		props.invalid ? error.primary : 'default'};
	:focus {
		border-color: ${(props: { invalid: boolean }) =>
			props.invalid ? error.primary : 'default'};
	}
`;

const FlexContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	margin-top: 6px;
	margin-bottom: 10px;
`;

const InvalidText = styled.div`
	color: ${error.primary};
	font-size: 12px;
	margin-left: 4px;
`;

const ExtraVideoControls = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: 8px;
`;

const maxCaptionLength = (max: number) => (value: ImageData) =>
	value && (value.caption?.length ?? 0) > max
		? `Must be ${max} characters or less`
		: undefined;

export const InvalidWarning = ({ warning }: { warning: string }) => (
	<FlexContainer>
		<WarningIcon size="s" fill={error.warningDark} />
		<InvalidText>{warning}</InvalidText>
	</FlexContainer>
);

const maxLength100 = maxCaptionLength(100);

const RenderSlideshow = ({
	fields,
	frontId,
	change,
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
	private isFirstLoad = true;
	private debouncedFetchAndSetReplacementVideoAtom: () => void;
	constructor(props: Props) {
		super(props);
		this.debouncedFetchAndSetReplacementVideoAtom = debounce(async () => {
			await this.fetchAndSetReplacementVideoAtom(this.props.atomId);
		}, 500);
	}

	async componentDidUpdate(prevProps: Readonly<Props>) {
		if (this.isFirstLoad) {
			this.isFirstLoad = false;
			await this.handleFirstLoad();
			return;
		}

		if (this.props.videoReplace && prevProps.atomId !== this.props.atomId) {
			this.debouncedFetchAndSetReplacementVideoAtom();
		}
	}

	private reinitialiseWithAtom = (replacementAtom: Atom | '') => {
		const reinitialisedValues = {
			...this.props.initialValues,
			replacementVideoAtom: replacementAtom,
		};

		this.props.initialize(reinitialisedValues);
		return;
	};

	private handleFirstLoad = async () => {
		if (
			!this.props.videoReplace ||
			this.props.atomId === '' ||
			this.props.atomId === undefined
		) {
			return;
		}
		const replacementAtomResponse = await this.getAtom(this.props.atomId);

		// Redux form prefers empty strings to undefined values
		const replacementAtom = isAtom(replacementAtomResponse)
			? replacementAtomResponse
			: '';

		if (this.props.pristine) {
			// If the form has not changed since the initial values, reinitialise the form with the hydrated atom
			// so that the form state remains 'pristine' and doesn't appear unsaved.
			this.reinitialiseWithAtom(replacementAtom);
		} else {
			// The form is already "dirty" with changes, so we can hydrate the atom without reinitialising.
			this.props.change('replacementVideoAtom', replacementAtom);
		}
	};

	private fetchAndSetReplacementVideoAtom = async (
		atomId: string | undefined,
	) => {
		if (atomId === undefined || atomId === '') {
			this.props.change('replacementVideoAtom', '');
			return;
		}
		this.fetchAtom(atomId)
			.then((response) => response.media)
			.then((replacementAtom) =>
				this.props.change('replacementVideoAtom', replacementAtom),
			)
			.catch((error) => {
				console.error(error);
				this.props.change('replacementVideoAtom', '');
			});
	};

	private fetchAtom = async (atomId: string): Promise<AtomResponse> => {
		const response = await fetch(`/api/live/${atomId}`);
		const data = await response.json();
		if (data?.response?.status !== 'ok') {
			throw new Error(`Failed to fetch atom ${atomId}`);
		} else {
			return data?.response;
		}
	};

	private getAtom = async (atomId: string): Promise<Atom | undefined> => {
		return this.fetchAtom(atomId)
			.then((response) => response.media)
			.catch(() => undefined);
	};

	public static getDerivedStateFromProps(props: Props) {
		return props.collectionId
			? { lastKnownCollectionId: props.collectionId }
			: {};
	}

	public state: FormComponentState = {
		lastKnownCollectionId: null,
	};

	//** we memoize this function to prevent renders of the toggles */
	private getBoostToggles = memoize(
		(
			groupSizeId: number | undefined,
			cardId: string,
			collectionType?: string,
		) => {
			return renderBoostToggles(
				groupSizeId,
				cardId,
				this.toggleCardStyleField,
				collectionType,
			);
		},
	);

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
			showMainVideo,
			videoReplace,
			mainMediaVideoAtom,
			replacementVideoAtom,
			videoBaseUrl,
			coverCardImageReplace,
			coverCardMobileImage,
			coverCardTabletImage,
			valid,
			groupSizeId,
			collectionType,
			form,
			snapType,
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

		const cardCriteria = this.determineCardCriteria();
		const extraVideoControlsId = getInputId(cardId, 'extra-video-controls');

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
							{[
								...this.getBoostToggles(groupSizeId, cardId, collectionType),
								<Field
									name="isImmersive"
									component={InputCheckboxToggleInline}
									label="Immersive"
									id={getInputId(cardId, 'immersive')}
									key={getInputId(cardId, 'immersive')}
									type="checkbox"
									onChange={(event: any) =>
										this.toggleCardStyleField(
											'isImmersive',
											event as boolean,
											groupSizeId,
										)
									}
								/>,
							]}
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
							<Row rowGap={4}>
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
								<ToggleCol flex={1}>
									<InputGroup>
										<ConditionalField
											permittedFields={editableFields}
											name="imageHide"
											component={InputCheckboxToggleInline}
											label="Hide media"
											id={getInputId(cardId, 'hide-media')}
											type="checkbox"
											default={false}
											onChange={() => this.changeMediaField('imageHide')}
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
												this.changeMediaField('imageCutoutReplace')
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
												this.changeMediaField('coverCardImageReplace')
											}
										/>
									</InputGroup>
									{primaryImage &&
										!!primaryImage.src &&
										!this.props.showMainVideo &&
										!this.props.imageSlideshowReplace && (
											<InputGroup>
												<ConditionalField
													permittedFields={editableFields}
													name="imageReplace"
													component={InputCheckboxToggleInline}
													label="Use replacement image"
													id={getInputId(cardId, 'image-replace')}
													type="checkbox"
													default={false}
													onChange={() => this.changeMediaField('imageReplace')}
												/>
											</InputGroup>
										)}
									{articleCapiFieldValues.urlPath && (
										// the below tag is empty and meaningless to the fronts tool itself, but serves as a handle for
										// Pinboard to attach itself via, identified/distinguished by the urlPath data attribute
										// @ts-ignore
										<pinboard-article-button
											data-url-path={articleCapiFieldValues.urlPath}
											data-with-draggable-thumbs-of-ratio={`${cardCriteria.widthAspectRatio}:${cardCriteria.heightAspectRatio}`}
										/>
									)}
								</ToggleCol>
								{/*
									Don't show media controls if the card has a snap type.
									When a card is a snap, we don't show a trail image, video or slideshow.
									Instead, we directly inject an atom onto the front.

									Replacement videos would break snap cards, because the snap and video are both
									competing for the underlying atomId field.
								*/}
								{snapType === undefined && (
									<Col flex={2}>
										<SelectMediaLabelContainer>
											<InputLabel htmlFor="media-select">
												Select Media
											</InputLabel>
											<Tooltip />
										</SelectMediaLabelContainer>
										<SelectMediaInput>
											<Field
												component={InputRadio}
												disabled={
													editableFields.indexOf(this.getImageFieldName()) ===
													-1
												}
												usesBlockStyling={true}
												name="media-select"
												type="radio"
												label="Trail Image"
												id={getInputId(cardId, 'select-trail-image')}
												value="select-trail-image"
												initialValues="select-trail-image"
												onClick={() =>
													this.changeMediaField(this.getImageFieldName())
												}
												checked={
													!this.props.showMainVideo &&
													!this.props.imageSlideshowReplace
												}
											/>
										</SelectMediaInput>
										<SelectMediaInput>
											<Field
												component={InputRadio}
												icon={<SelectVideoIcon />}
												contents={
													<VideoControls
														videoBaseUrl={videoBaseUrl}
														mainMediaVideoAtom={mainMediaVideoAtom}
														replacementVideoAtom={replacementVideoAtom}
														showMainVideo={showMainVideo}
														showReplacementVideo={videoReplace}
														changeField={change}
														changeMediaField={this.changeMediaField}
														form={form}
														extraVideoControlsId={extraVideoControlsId}
													/>
												}
												usesBlockStyling={true}
												name="media-select"
												type="radio"
												label="Video"
												id={getInputId(cardId, 'select-video')}
												value="select-video"
												onClick={() =>
													this.changeMediaField(this.getVideoFieldName())
												}
												checked={
													this.props.showMainVideo || this.props.videoReplace
												}
											/>
											<ExtraVideoControls id={extraVideoControlsId} />
										</SelectMediaInput>
										<SelectMediaInput>
											<Field
												component={InputRadio}
												disabled={
													editableFields.indexOf('imageSlideshowReplace') === -1
												}
												icon={<SlideshowIcon />}
												usesBlockStyling={true}
												name="media-select"
												type="radio"
												label="Slideshow"
												id={getInputId(cardId, 'select-slideshow')}
												value="select-slideshow"
												onClick={() =>
													this.changeMediaField('imageSlideshowReplace')
												}
												checked={
													this.props.imageSlideshowReplace !== undefined
														? this.props.imageSlideshowReplace
														: false
												}
											/>
										</SelectMediaInput>
									</Col>
								)}
							</Row>
							<ConditionalComponent
								permittedNames={editableFields}
								name={['primaryImage', 'imageHide']}
							/>
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
						</ImageRowContainer>
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
				<div>
					{imageSlideshowReplace && !slideshowHasAtLeastTwoImages ? (
						<InvalidWarning warning="You need at least two images to make a slideshow" />
					) : null}
					{(showMainVideo && !hasMainVideo) ||
					(videoReplace && !isAtom(replacementVideoAtom)) ? (
						<InvalidWarning warning="You need to provide a valid video" />
					) : null}
				</div>
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
							(imageSlideshowReplace && !slideshowHasAtLeastTwoImages) ||
							(showMainVideo && !hasMainVideo) ||
							(videoReplace && !isAtom(replacementVideoAtom))
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

	private getVideoFieldName = () => {
		if (
			this.props.replaceVideoUri !== undefined &&
			this.props.replaceVideoUri !== null &&
			this.props.replaceVideoUri !== ''
		) {
			return 'videoReplace';
		}
		return 'showMainVideo';
	};

	private handleImageChange: EventWithDataHandler<React.ChangeEvent<any>> = (
		e: unknown,
		...args: [any?, any?, string?]
	) => {
		// If we don't already have an image override enabled, enable the default imageReplace property.
		// This saves the user a click; adding an image without enabling would be very unusual.
		if (!this.props.imageCutoutReplace && !this.props.imageReplace) {
			this.changeMediaField('imageReplace');
		}

		this.props.change(this.getImageFieldName(), e);
	};

	private changeMediaField = (fieldToSet: string) => {
		const allMediaFields = [
			'imageHide',
			'imageCutoutReplace',
			'imageSlideshowReplace',
			'imageReplace',
			'showMainVideo',
			'coverCardImageReplace',
			'videoReplace',
		];

		allMediaFields.forEach((field) => {
			if (field === fieldToSet) {
				this.props.change(field, true);
			} else {
				this.props.change(field, false);
			}
		});
	};

	//*
	// immersive card styling and boost levels are mutually exclusive.
	// A card cannot be both immersive and boosted, so we need to toggle the other field when one is set.
	// This function is called when one of the fields is toggled, and sets the other field to false.
	// If the field to set is `isImmersive` to true, we need to set the boost level to lowest boost level (default).
	// If the fiels to set is `isImmersive` to false, we need to set the boost level to the default setting for that group.
	// If the field to set is `isBoosted`, we need to reset the immersive flag to false.
	// */
	private toggleCardStyleField = (
		fieldToSet: string,
		value?: boolean,
		group: number = 0,
	) => {
		if (fieldToSet === 'isImmersive') {
			const defaultBoostLevel = !value
				? CollectionToggles['flexible/general'][group][0].value
				: 'default';
			this.props.change('boostLevel', defaultBoostLevel);
		} else {
			this.props.change('isImmersive', false);
		}
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
		if (
			!collectionType ||
			COLLECTIONS_USING_LANDSCAPE_5_TO_4_TRAILS.includes(collectionType)
		) {
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
	showMainVideo: boolean;
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
	mainMediaVideoAtom: Atom | undefined;
	videoReplace: boolean;
	replaceVideoUri: string;
	atomId: string;
	replacementVideoAtom: Atom | undefined | string;
	videoBaseUrl: string | null;
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
			mainMediaVideoAtom:
				!!article && !!article.hasMainVideo
					? getMainMediaVideoAtom(article)
					: undefined,
			collectionId,
			getLastUpdatedBy,
			snapType: article && article.snapType,
			initialValues: getInitialValuesForCardForm(article),
			articleCapiFieldValues: getCapiValuesForArticleFields(externalArticle),
			editableFields:
				article && selectFormFields(state, article.uuid, isSupporting),
			kickerOptions: article ? selectArticleTag(state, cardId) : defaultObject,
			imageSlideshowReplace: valueSelector(state, 'imageSlideshowReplace'),
			showMainVideo: valueSelector(state, 'showMainVideo'),
			slideshow: valueSelector(state, 'slideshow'),
			imageHide: valueSelector(state, 'imageHide'),
			imageReplace: valueSelector(state, 'imageReplace'),
			imageCutoutReplace: valueSelector(state, 'imageCutoutReplace'),
			videoReplace: valueSelector(state, 'videoReplace'),
			replaceVideoUri: valueSelector(state, 'replaceVideoUri'),
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
			atomId: valueSelector(state, 'atomId'),
			replacementVideoAtom: valueSelector(state, 'replacementVideoAtom'),
			videoBaseUrl: selectVideoBaseUrl(state),
		};
	};
};

export { getCardMetaFromFormValues, getInitialValuesForCardForm };

export default connect<ContainerProps, {}, InterfaceProps, State>(
	createMapStateToProps,
)(formContainer);
