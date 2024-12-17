import React from 'react';
import { theme, styled } from 'constants/theme';
import { connect } from 'react-redux';
import { WrappedFieldProps } from 'redux-form';
import { events } from 'services/GA';

import ButtonDefault from './ButtonDefault';
import InputContainer from './InputContainer';
import InputBase from './InputBase';
import InputLabel from './InputLabel';
import DragIntentContainer from '../DragIntentContainer';
import { GridModal } from 'components/modals/GridModal';
import {
	validateImageEvent,
	validateMediaItem,
	validateImageSrc,
} from '../../util/validateImageSrc';
import { selectGridUrl } from 'selectors/configSelectors';
import type { State } from 'types/State';
import { GridData, Criteria } from 'types/Grid';
import {
	RubbishBinIcon,
	ConfirmDeleteIcon,
	AddImageIcon,
	VideoIcon,
	WarningIcon,
	CropIcon,
} from '../icons/Icons';
import imageDragIcon from 'images/icons/image-drag-icon.svg';
import {
	DRAG_DATA_GRID_IMAGE_URL,
	landscape5To4CardImageCriteria,
	portraitCardImageCriteria,
	squareImageCriteria,
} from 'constants/image';
import ImageDragIntentIndicator from 'components/image/ImageDragIntentIndicator';
import { ImageInputImageContainer as ImageContainer } from 'components/image/ImageInputImageContainer';
import { EditMode } from 'types/EditMode';
import { selectEditMode } from '../../selectors/pathSelectors';
import CircularIconContainer from '../icons/CircularIconContainer';
import { error } from '../../styleConstants';
import ValidatingSpinnerOverlay from '../image/ValidatingSpinnerOverlay';

const AddImageButton = styled(ButtonDefault)<{ small?: boolean }>`
	background-color: ${({ small }) =>
		small ? theme.colors.greyLight : `#5e5e5e50`};
	&:hover,
	&:active,
	&:hover:enabled,
	&:active:enabled {
		background-color: ${({ small }) =>
			small ? theme.colors.greyVeryLight : '#5e5e5e99'};
	}
	width: 100%;
	flex-grow: 1;
	padding: 0;
	text-shadow: 0 0 2px black;
	display: inline-block;
`;

const ImageComponent = styled.div<{
	small: boolean;
	portrait: boolean;
	shouldShowLandscape54: boolean;
	showSquare: boolean;
	shouldShowPortrait: boolean;
}>`
	${({ small }) =>
		small
			? `position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;`
			: 'position: relative;'}
	background-size: cover;
	${({ small, portrait }) =>
		small && portrait
			? `
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    `
			: ``}
	${({ shouldShowLandscape54 }) =>
		shouldShowLandscape54 &&
		`aspect-ratio: 5/4;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;`}
	${({ showSquare }) =>
		showSquare &&
		`aspect-ratio: 1/1;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
	width: 95%;
	height: 95%;
	align-self: center;`}
	${({ shouldShowPortrait }) =>
		shouldShowPortrait &&
		`aspect-ratio: 4/5;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center;`}
  flex-grow: 1;
	cursor: grab;
`;

const AddImageViaGridModalButton = styled.div`
	display: flex;
	height: 100%;
	justify-content: center;
	align-items: center;
	flex-grow: 1;
	flex-direction: column;
`;

const AddImageViaUrlInput = styled(InputContainer)`
	flex-grow: 0;
	margin-top: 5px;
`;

const ImageUrlInput = styled(InputBase)`
	border: none;
	:focus,
	:active {
		border: none;
	}
	::placeholder {
		font-size: 12px;
	}
`;

const Label = styled(InputLabel)`
	cursor: pointer;
	display: inline-block;
	color: ${(props) => props.theme.base.colors.textLight};
	padding-inline-start: 5px;
	vertical-align: super;
`;

const ButtonDelete = styled(ButtonDefault)<{
	confirmDelete?: boolean;
}>`
	position: absolute;
	display: block;
	top: -10px;
	right: -6px;
	height: 24px;
	width: 24px;
	text-align: center;
	padding: 0;
	border-radius: 20px;
	background-color: ${(props) =>
		props.confirmDelete ? error.warningLight : 'default'};
	:hover {
		background-color: ${(props) =>
			props.confirmDelete ? error.warningLight : 'default'};
	}
	&:hover:enabled {
		background-color: ${(props) =>
			props.confirmDelete ? error.warningLight : 'default'};
	}
	&:focus {
		outline: none;
	}
`;

const DeleteIconOptions = styled.div`
	display: block;
	position: absolute;
	height: 14px;
	width: 14px;
	top: 5px;
	left: 5px;
`;

const ButtonWarning = styled(ButtonDefault)`
	position: absolute;
	display: block;
	top: 16px;
	right: -6px;
	height: 24px;
	width: 24px;
	text-align: center;
	padding: 0;
	border-radius: 20px;
	background-color: ${error.warningDark};
	:hover {
		background-color: ${error.warningDark};
	}
	&:hover:enabled {
		background-color: ${error.warningDark};
	}
	&:focus {
		outline: none;
	}
`;

const IconWarning = styled.div`
	display: block;
	position: absolute;
	height: 14px;
	width: 14px;
	top: 5px;
	left: 5px;
`;

const VideoIconContainer = styled(CircularIconContainer)`
	position: absolute;
	bottom: 2px;
	right: 2px;
`;

const InputImageContainer = styled(InputContainer)<{
	small: boolean;
	isDragging?: boolean;
	isSelected?: boolean;
	isInvalid?: boolean;
	confirmDelete?: boolean;
}>`
	position: relative;
	${(props) => !props.small && `padding: 5px;`}
	background-color: ${(props) => props.theme.colors.greyLight};
	${(props) =>
		props.isDragging && `box-shadow: inset 0 -10px 0 ${theme.colors.orange}`};
	${(props) =>
		props.isSelected && !props.confirmDelete
			? `box-shadow: 0px 0px 0 2px ${theme.colors.orange};`
			: ''}
	${(props) =>
		!props.isSelected && props.isInvalid
			? `box-shadow: 0px 0px 0 2px ${error.warningDark};`
			: ''}
  ${(props) =>
		props.confirmDelete
			? `box-shadow: 0px 0px 0 2px ${error.warningLight};`
			: ''}
  :hover {
		${(props) =>
			!props.confirmDelete
				? `box-shadow: 0px 0px 0 2px ${theme.colors.orangeLight}`
				: ``};
	}
`;

export interface InputImageContainerProps {
	disabled?: boolean;
	frontId: string;
	criteria?: Criteria;
	small?: boolean;
	defaultImageUrl?: string;
	useDefault?: boolean;
	hasVideo?: boolean;
	message?: string;
	replaceImage: boolean;
	isSelected?: boolean;
	isInvalid?: boolean;
	collectionType?: string;
}

type ComponentProps = InputImageContainerProps &
	WrappedFieldProps & { gridUrl: string | null; editMode: EditMode };

interface ComponentState {
	isDragging: boolean;
	modalOpen: boolean;
	imageSrc: string;
	confirmDelete: boolean;
	cancelDeleteTimeout: undefined | (() => void);
	isRecropping: boolean;
	isValidating: boolean;
}

const dragImage = new Image();
dragImage.src = imageDragIcon;

const regexToCheckGridImage: RegExp =
	/^https?:\/\/(www\.)?media\.(?:dev-|)guim\.co\.uk\/([0-9a-fA-F]+)\//;

class InputImage extends React.Component<ComponentProps, ComponentState> {
	private inputRef = React.createRef<HTMLInputElement>();

	public constructor(props: ComponentProps) {
		super(props);

		const { value } = props.input;
		const valueRecord =
			value && typeof value === 'object'
				? (value as Record<string, unknown>)
				: undefined;

		const { src } = valueRecord ?? {};
		const imageSrc = typeof src === 'string' ? src : '';

		this.state = {
			isDragging: false,
			modalOpen: false,
			imageSrc,
			confirmDelete: false,
			cancelDeleteTimeout: undefined,
		} as ComponentState;
	}

	public render() {
		const {
			small = false,
			input,
			gridUrl: gridBaseUrl,
			useDefault,
			defaultImageUrl,
			message = 'Replace image',
			hasVideo,
			disabled,
			isSelected,
			isInvalid,
			criteria,
		} = this.props;

		const imageDims = this.getCurrentImageDimensions();

		if (!gridBaseUrl) {
			return (
				<div>
					<code>gridUrl</code> config value missing
				</div>
			);
		}

		const isImgFromGrid = defaultImageUrl
			? regexToCheckGridImage.test(defaultImageUrl)
			: false;

		const hasImage = !useDefault && !!input.value && !!input.value.thumb;
		const imageUrl =
			!useDefault && input.value && input.value.thumb
				? input.value.thumb
				: defaultImageUrl;

		// e.g. https://media.guim.co.uk/db6bf997dee6d43f8dca1ab9cd2c7402725434b6/0_214_3960_2376/500.jpg
		const maybeDefaultImagePathParts =
			defaultImageUrl && new URL(defaultImageUrl).pathname.split('/');
		const maybeDefaultImageId = maybeDefaultImagePathParts?.[1]; // pathname starts with / so index 0 is empty string
		const maybeDefaultCropId = maybeDefaultImagePathParts?.[2];
		const gridUrl =
			this.state.isRecropping && maybeDefaultImageId && maybeDefaultCropId
				? `${gridBaseUrl}/images/${maybeDefaultImageId}/crop?seedCropId=${maybeDefaultCropId}&`
				: `${gridBaseUrl}?`;
		const gridModalUrl = `${gridUrl}${new URLSearchParams(
			this.criteriaToGridQueryParams(),
		).toString()}`;

		const portraitImage = !!(
			!useDefault &&
			imageDims &&
			imageDims.height > imageDims.width
		);
		const shouldShowPortrait =
			criteria != null &&
			this.compareAspectRatio(portraitCardImageCriteria, criteria);
		const shouldShowLandscape54 =
			criteria != null &&
			this.compareAspectRatio(landscape5To4CardImageCriteria, criteria);
		const showSquare =
			criteria != null &&
			this.compareAspectRatio(squareImageCriteria, criteria);

		return (
			<InputImageContainer
				small={small}
				isDragging={this.state.isDragging}
				isSelected={isSelected}
				isInvalid={isInvalid}
				confirmDelete={this.state.confirmDelete}
			>
				<GridModal
					url={gridModalUrl}
					isOpen={this.state.modalOpen}
					onClose={this.closeModal}
					onMessage={this.onMessage}
				/>
				<DragIntentContainer
					active
					onIntentConfirm={() => this.setState({ isDragging: true })}
					onDragIntentStart={() => this.setState({ isDragging: true })}
					onDragIntentEnd={() => this.setState({ isDragging: false })}
				>
					<ImageContainer
						small={small}
						shouldShowPortrait={shouldShowPortrait}
						shouldShowLandscape54={shouldShowLandscape54}
						showSquare={showSquare}
					>
						<ImageComponent
							style={{
								backgroundImage: `url(${imageUrl}`,
							}}
							draggable
							onDragStart={this.handleDragStart}
							onDrop={this.handleDrop}
							small={small}
							portrait={portraitImage}
							shouldShowLandscape54={shouldShowLandscape54}
							showSquare={showSquare}
							shouldShowPortrait={shouldShowPortrait}
						>
							{hasImage ? (
								<>
									<ButtonDelete
										type="button"
										priority="primary"
										onClick={this.handleDelete}
										disabled={disabled}
										confirmDelete={this.state.confirmDelete}
									>
										<DeleteIconOptions>
											{this.state.confirmDelete ? (
												<ConfirmDeleteIcon size="s" />
											) : (
												<RubbishBinIcon size="s" />
											)}
										</DeleteIconOptions>
									</ButtonDelete>

									{isInvalid ? (
										<ButtonWarning>
											<IconWarning>
												<WarningIcon size="s" />
											</IconWarning>
										</ButtonWarning>
									) : null}
								</>
							) : (
								<AddImageViaGridModalButton>
									<AddImageButton
										type="button"
										onClick={this.openModal(false)}
										small={small}
										disabled={disabled}
									>
										<AddImageIcon size="l" />
										{!!small ? null : <Label size="sm">{message}</Label>}
									</AddImageButton>
									{isImgFromGrid && (
										<AddImageButton
											type="button"
											onClick={this.openModal(true)}
											small={small}
											disabled={disabled}
										>
											<CropIcon size="l" fill={theme.colors.white} />
											{!!small ? null : <Label size="sm">Recrop image</Label>}
										</AddImageButton>
									)}
								</AddImageViaGridModalButton>
							)}
							{hasVideo && useDefault && (
								<VideoIconContainer title="This media has video content.">
									<VideoIcon />
								</VideoIconContainer>
							)}
						</ImageComponent>
						{!!small ? null : (
							<AddImageViaUrlInput>
								<ImageUrlInput
									name="paste-url"
									placeholder=" Paste crop url"
									defaultValue={
										this.state.imageSrc || (input.value && input.value.origin)
									}
									onChange={this.handlePasteImgSrcChange}
									onFocus={this.handleFocus}
									ref={this.inputRef}
									disabled={disabled}
								/>
								<InputLabel hidden htmlFor="paste-url">
									Paste crop url
								</InputLabel>
							</AddImageViaUrlInput>
						)}
					</ImageContainer>
				</DragIntentContainer>
				{this.state.isDragging && <ImageDragIntentIndicator />}
				{this.state.isValidating && <ValidatingSpinnerOverlay />}
			</InputImageContainer>
		);
	}

	public componentWillUnmount = () => {
		this.state.cancelDeleteTimeout?.();
	};

	private handleFocus = () => {
		if (this.inputRef.current) {
			this.inputRef.current.select();
		}
	};

	private handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();

		if (!this.state.confirmDelete) {
			const resetTimer = setTimeout(
				() => this.setState({ confirmDelete: false }),
				3000,
			);

			this.setState({
				confirmDelete: true,
				cancelDeleteTimeout: () => clearTimeout(resetTimer),
			});
			return;
		}

		this.setState({ confirmDelete: false });
		this.clearField();
	};

	private handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
		const origin =
			(!this.props.useDefault && this.props.input.value.origin) ||
			this.props.defaultImageUrl;
		if (origin) {
			e.dataTransfer.setData(DRAG_DATA_GRID_IMAGE_URL, origin);
			e.dataTransfer.setDragImage(dragImage, -25, 50);
		}
	};

	private handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		events.imageAdded(this.props.frontId, 'drop');
		e.preventDefault();
		this.setState({ isValidating: true });
		validateImageEvent(e, this.props.frontId, this.props.criteria)
			.then(this.props.input.onChange)
			.catch((err) => {
				alert(err);
				console.log('@todo:handle error', err);
			})
			.finally(() => this.setState({ isValidating: false }));
	};

	private handlePasteImgSrcChange = (e: React.FormEvent<HTMLInputElement>) => {
		e.preventDefault();
		e.persist();
		this.setState(
			{ imageSrc: e.currentTarget.value },
			this.validateAndGetPastedImage,
		);
	};

	private validateAndGetPastedImage = () => {
		events.imageAdded(this.props.frontId, 'paste');
		this.setState({ isValidating: true });
		validateImageSrc(
			this.state.imageSrc,
			this.props.frontId,
			this.props.criteria,
		)
			.then(this.props.input.onChange)
			.catch((err) => {
				alert(err);
				console.log('@todo:handle error', err);
			})
			.finally(() => this.setState({ isValidating: false }));
		this.setState({ imageSrc: '' });
	};

	private clearField = () => {
		return this.props.input.onChange(null);
	};

	private validMessage(data: GridData) {
		return data && data.crop && data.crop.data && data.image && data.image.data;
	}

	private onMessage = (event: MessageEvent) => {
		if (event.origin !== this.props.gridUrl) {
			// Log: did not come from the grid
			return;
		}

		const data: GridData = event.data;

		if (!data) {
			// TODO Log did not get data
			return;
		}

		if (!this.validMessage(data)) {
			// TODO Log not a valid message
			return;
		}

		this.closeModal();
		const crop = data.crop.data;
		const gridImage = data.image.data;
		const imageOrigin = `${this.props.gridUrl}/images/${gridImage.id}`;

		return validateMediaItem(
			crop,
			imageOrigin,
			this.props.frontId,
			this.props.criteria,
		)
			.then((mediaItem) => {
				events.imageAdded(this.props.frontId, 'click to modal');
				this.props.input.onChange(mediaItem);
			})
			.catch((err) => {
				alert(err);
				console.log('@todo:handle error', err);
			});
	};

	private closeModal = () => {
		this.setState({ modalOpen: false });
		window.removeEventListener('message', this.onMessage, false);
	};

	private openModal = (isRecropping: boolean) => () => {
		this.setState({ modalOpen: true, isRecropping });
		window.addEventListener('message', this.onMessage, false);
	};

	private compareAspectRatio = (criteria1: Criteria, criteria2: Criteria) => {
		return (
			criteria1.widthAspectRatio == criteria2.widthAspectRatio &&
			criteria1.heightAspectRatio == criteria2.heightAspectRatio
		);
	};

	private criteriaToGridQueryParams = (): Record<string, string> => {
		const { criteria, editMode } = this.props;

		if (editMode === 'editions') {
			return {};
		}

		if (!criteria) {
			return {
				cropType: 'portrait,landscape',
			};
		}

		// assumes the only criteria that will be passed as props the defined
		// constants for portrait(4:5), landscape (5:3), landscape (5:4) or square (1:1)
		if (this.compareAspectRatio(portraitCardImageCriteria, criteria)) {
			return {
				cropType: 'portrait',
			};
		} else if (
			this.compareAspectRatio(landscape5To4CardImageCriteria, criteria)
		) {
			return {
				cropType: 'Landscape',
				customRatio: 'Landscape,5,4',
			};
		} else if (this.compareAspectRatio(squareImageCriteria, criteria)) {
			return {
				cropType: 'square',
			};
		} else {
			return {
				cropType: 'landscape',
			};
		}
	};

	private getCurrentImageDimensions = () => {
		const { value } = this.props.input;
		const valueRecord =
			value && typeof value === 'object'
				? (value as Record<string, unknown>)
				: undefined;

		const { height, width } = valueRecord ?? {};

		return typeof height === 'number' && typeof width === 'number'
			? {
					height,
					width,
				}
			: undefined;
	};
}

const mapStateToProps = (state: State) => {
	return {
		gridUrl: selectGridUrl(state),
		editMode: selectEditMode(state),
	};
};

export default connect(mapStateToProps)(InputImage);
