import React, { useEffect } from 'react';
import styled from 'styled-components';
import ButtonDefault from '../inputs/ButtonDefault';
import InputBase from '../inputs/InputBase';
import { createPortal } from 'react-dom';
import {CloseIcon, PreviewVideoIcon, ReplaceVideoIcon} from '../icons/Icons';
import InputCheckboxToggleInline from "../inputs/InputCheckboxToggleInline";
import {Field} from "redux-form";
import {extractAtomId} from "../../util/extractAtomId";

interface VideoControlsProps {
	mainMediaVideoAtom: any;
	replacementVideoAtomId: string;
	active: boolean;
	usesReplacementVideo: boolean;
	changeMediaField: (fieldToSet: string) => void;
	changeAtomIdField: (atomId: string) => void;
}

const fetchAtom = async (atomId: string): Promise<any> => {
	const response = await fetch(`/api/live/atom/video/${atomId}`);
	const data = await response.json();
	if (data?.response?.status !== 'ok') {
		throw new Error(`Failed to fetch atom ${atomId}`);
	} else {
		return data?.response;
	}
};

const extractAssetId = (atom: any): string | undefined => {
	const assets = atom?.data?.media?.assets;
	if (
		assets === undefined ||
		assets.length === 0 ||
		assets[0] === undefined ||
		assets[0].id === undefined
	) {
		throw new Error(`No assets found for atom ${atom.id}`);
	} else {
		return assets[0].id;
	}
};

const extractVideoTrailImage = (atom: any): string | undefined => {
	const imageAssets = atom?.data?.media?.trailImage?.assets;

	if (
		imageAssets === undefined ||
		imageAssets.length === 0 ||
		imageAssets[0] === undefined ||
		imageAssets[0].file === undefined
	) {
		throw new Error(`No trail image found for atom ${atom.id}`);
	} else {
		return imageAssets[0].file;
	}
};

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

const VideoUrlInput = styled(InputBase)`
	border: none;
	:focus,
	:active {
		border: none;
	}
	::placeholder {
		font-size: 12px;
	}
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
	replacementVideoAtomId,
	active,
	usesReplacementVideo,
	changeMediaField,
	changeAtomIdField,
}: VideoControlsProps) => {
	const [replacementAtom, setReplacementAtom] = React.useState<any | undefined>(undefined);
	const [mainMediaVideoAssetId, setMainMediaVideoAssetId] = React.useState<string | undefined>(undefined);
	const [mainMediaTrailImageUri, setMainMediaTrailImageUri] = React.useState<string | undefined>(undefined);
	const [replacementVideoAssetId, setReplacementVideoAssetId] = React.useState<string | undefined>(undefined);
	const [showVideoPreviewModal, setShowVideoPreviewModal] =
		React.useState<boolean>(false);
	const [replacementTrailImageUri, setReplacementTrailImageUri] = React.useState<string | undefined>(
		undefined,
	);

	useEffect(() => {
		// TODO: Fetch on debounce?
		if (replacementVideoAtomId === "") {
			return;
		}
		fetchAtom(replacementVideoAtomId)
			.then((response) => response.media)
			.then((replacementAtom) => setReplacementAtom(replacementAtom))
			.catch((error) => console.error(error));
	}, [replacementVideoAtomId]);

	useEffect(() => {
		if(replacementAtom === undefined) {
			return;
		}
		const assetId = extractAssetId(replacementAtom);
		if (assetId !== undefined) {
			setReplacementVideoAssetId(assetId);
		}

		const trailImage = extractVideoTrailImage(replacementAtom);
		if (trailImage !== undefined) {
			setReplacementTrailImageUri(trailImage);
		}
	}, [replacementAtom]);

	useEffect(() => {
		if(!mainMediaVideoAtom) {
			return;
		}

		const assetId = extractAssetId(mainMediaVideoAtom);
		if (assetId !== undefined) {
			setMainMediaVideoAssetId(assetId);
		}

		const trailImage = extractVideoTrailImage(mainMediaVideoAtom);
		if (trailImage !== undefined) {
			setMainMediaTrailImageUri(trailImage);
		}
	}, [mainMediaVideoAtom]);

	if (!active) {
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
					checked={usesReplacementVideo}
					onChange={() => {
						if(usesReplacementVideo) {
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
								src={`https://www.youtube.com/embed/${usesReplacementVideo ? replacementVideoAssetId : mainMediaVideoAssetId}`}
								allowFullScreen={true}
							></iframe>
						</VideoPreviewModal>,
						document.body,
					)
				: null}
			<VideoControlsOuterContainer>
				<VideoControlsInnerContainer url={usesReplacementVideo ? replacementTrailImageUri : mainMediaTrailImageUri}>
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
				</VideoControlsInnerContainer>
				<VideoUrlInput
					name="replaceVideoUri"
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

						changeAtomIdField(extractAtomId(value));
					}}
					placeholder="Paste video url"
				/>
			</VideoControlsOuterContainer>
		</>
	);
};
