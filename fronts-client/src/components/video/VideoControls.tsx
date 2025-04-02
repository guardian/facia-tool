import React, {useEffect} from 'react';
import styled from 'styled-components';
import ButtonDefault from '../inputs/ButtonDefault';
import { createPortal } from 'react-dom';
import {CloseIcon, ConfirmDeleteIcon, PreviewVideoIcon, ReplaceVideoIcon, RubbishBinIcon} from '../icons/Icons';
import InputCheckboxToggleInline from "../inputs/InputCheckboxToggleInline";
import {autofill, change, Field} from "redux-form";
import {extractAtomId, extractAtomProperties} from "../../util/extractAtomId";
import {ButtonDelete, DeleteIconOptions} from "../inputs/InputImage";
import {VideoUriInput} from "../inputs/VideoUriInput";
import {useDispatch} from "react-redux";

interface VideoControlsProps {
	mainMediaVideoAtom: any;
	replacementVideoAtom: any;
	showMainVideo: boolean;
	showReplacementVideo: boolean;
	changeField: (field: string, value: any) => void;
	changeMediaField: (fieldToSet: string) => void;
	form: any;
}


const VideoControlsOuterContainer = styled.div`
	margin-top: 8px;
	position: relative;
`;

const VideoAction = styled(ButtonDefault)<{ small?: boolean }>`
	background-color: #5e5e5e50;
	&:hover,
	&:active,
	&:hover:enabled,
	&:active:enabled {
		background-color: #5e5e5e99;
	}
	height: 50%;
	width: 100%;
	font-size: 12px;
	flex-grow: 1;
	padding: 0;
	text-shadow: 0 0 2px black;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	gap: 4px;
`;

const VideoControlsInnerContainer = styled.div<{ url?: string }>`
	background-image: url(${(props) => props.url});
	height: 100%;
	position: relative;
	aspect-ratio: 5 / 4;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
	-webkit-box-flex: 1;
	flex-grow: 1;
	margin-bottom: 5px;
	//cursor: grab;
`;

const VideoPreviewModal = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
	& > iframe {
		width: 80%;
		height: 80%;
	}
`;

const CloseModalButton = styled(ButtonDefault)`
	position: absolute;
	top: 16px;
	right: 16px;
	height: 60px;
	width: 80px;
`;

export const VideoControls = ({
	mainMediaVideoAtom,
	replacementVideoAtom,
	showMainVideo,
	showReplacementVideo,
	changeField,
	changeMediaField,
	form
}: VideoControlsProps) => {
	// Derived from mainMediaVideoAtom
	const [mainMediaVideoAssetId, setMainMediaVideoAssetId] = React.useState<string | undefined>(undefined);
	const [mainMediaTrailImageUri, setMainMediaTrailImageUri] = React.useState<string | undefined>(undefined);

	// Derived from replacementVideoAtom
	const [replacementVideoAssetId, setReplacementVideoAssetId] = React.useState<string | undefined>(undefined);
	const [replacementTrailImageUri, setReplacementTrailImageUri] = React.useState<string | undefined>(
		undefined,
	);

	const [showVideoPreviewModal, setShowVideoPreviewModal] =
		React.useState<boolean>(false);
	const [confirmDelete, setConfirmDelete] = React.useState<boolean>(false);
	const dispatch = useDispatch();
	const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();

		if (!confirmDelete) {
			setConfirmDelete(true);
			setTimeout(
				() => setConfirmDelete(false),
				3000,
			);
			return;
		}

		// This exact incantation is needed to clear the form fields...
		dispatch(autofill(form, 'replaceVideoUri', undefined));
		dispatch(autofill(form, 'replacementVideoAtomId', undefined));
		dispatch(change(form, 'replacementVideoAtom', undefined));
		changeMediaField('showMainVideo');
		setConfirmDelete(false);
	};

	useEffect(() => {
		const { assetId, trailImage } = extractAtomProperties(replacementVideoAtom);
		setReplacementVideoAssetId(assetId);
		setReplacementTrailImageUri(trailImage);
	}, [replacementVideoAtom]);

	useEffect(() => {
		const { assetId, trailImage } = extractAtomProperties(mainMediaVideoAtom);
		setMainMediaVideoAssetId(assetId);
		setMainMediaTrailImageUri(trailImage);
	}, [mainMediaVideoAtom]);

	if (!showMainVideo && !showReplacementVideo) {
		return null;
	}

	const controlColumn = document.getElementById('video-control-col');

	return (
		<>
			{controlColumn !== null ? createPortal(
				<Field
					name="useReplacementVideo"
					component={InputCheckboxToggleInline}
					label="Use replacement video"
					id={"useReplacementVideo"}
					type="checkbox"
					dataTestId="use-replacement-video"
					checked={showReplacementVideo}
					onChange={() => {
						if(showReplacementVideo) {
							changeMediaField('showMainVideo');
						} else {
							changeMediaField('videoReplace')
						}
					}}
				/>, controlColumn) : null}
			{(mainMediaVideoAssetId || replacementVideoAssetId) && showVideoPreviewModal
				? createPortal(
						<VideoPreviewModal onClick={() => setShowVideoPreviewModal(false)}>
							<CloseModalButton
								priority="primary"
								onClick={() => setShowVideoPreviewModal(false)}
							>
								<CloseIcon />
							</CloseModalButton>
							<iframe
								src={`https://www.youtube.com/embed/${showReplacementVideo ? replacementVideoAssetId : mainMediaVideoAssetId}`}
								allowFullScreen={true}
							></iframe>
						</VideoPreviewModal>,
						document.body,
					)
				: null}
			<VideoControlsOuterContainer>
				<VideoControlsInnerContainer url={showReplacementVideo ? replacementTrailImageUri : mainMediaTrailImageUri}>
					<VideoAction
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							console.log('replace video');
						}}
					>
						<ReplaceVideoIcon/>
						Replace video
					</VideoAction>
					<VideoAction
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setShowVideoPreviewModal(true);
						}}
					>
						<PreviewVideoIcon/>
						Preview video
					</VideoAction>
					{
						showReplacementVideo && replacementVideoAtom && <ButtonDelete
							type="button"
							priority="primary"
							onClick={handleDelete}
							disabled={false}
							confirmDelete={confirmDelete}
						>
							<DeleteIconOptions>
								{confirmDelete ? (
									<ConfirmDeleteIcon size="s"/>
								) : (
									<RubbishBinIcon size="s"/>
								)}
							</DeleteIconOptions>
						</ButtonDelete>
					}
				</VideoControlsInnerContainer>
				<Field
					name="replaceVideoUri"
					component={VideoUriInput}
					type="text"
					onChange={(e: any) => {
						const value = e.currentTarget.value;

						if (
							value !== undefined &&
							value !== null &&
							value !== ''
						) {
							changeMediaField('videoReplace');
						} else {
							changeMediaField('showMainVideo');
						}

						changeField('replacementVideoAtomId', extractAtomId(value));
					}}
					placeholder="Paste video url">
				</Field>
			</VideoControlsOuterContainer>
		</>
	);
};
