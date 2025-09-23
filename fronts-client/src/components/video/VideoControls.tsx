import React, { useEffect } from 'react';
import styled from 'styled-components';
import ButtonDefault from '../inputs/ButtonDefault';
import { createPortal } from 'react-dom';
import {
	ConfirmDeleteIcon,
	LoopIcon,
	PreviewVideoIcon,
	ReplaceVideoIcon,
	RubbishBinIcon,
} from '../icons/Icons';
import InputCheckboxToggleInline from '../inputs/InputCheckboxToggleInline';
import { autofill, change, Field } from 'redux-form';
import {
	extractAtomId,
	extractMediaAtomActiveAssets,
	MediaAtomActiveAssets,
	stripQueryParams,
} from '../../util/extractAtomId';
import { ButtonDelete, DeleteIconOptions } from '../inputs/InputImage';
import { VideoUriInput } from '../inputs/VideoUriInput';
import { useDispatch } from 'react-redux';
import Explainer from '../Explainer';
import { OverlayModal } from '../modals/OverlayModal';
import type { Atom } from '../../types/Capi';
import urlConstants from '../../constants/url';
import { isAtom } from '../../util/atom';

interface VideoControlsProps {
	videoBaseUrl: string | null;
	mainMediaVideoAtom: Atom | undefined;
	replacementVideoAtom: Atom | undefined | string;
	showMainVideo: boolean;
	showReplacementVideo: boolean;
	changeField: (field: string, value: any) => void;
	changeMediaField: (fieldToSet: string) => void;
	form: any;
	extraVideoControlsId: string;
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
`;

const MarginWrapper = styled.div`
	margin-bottom: 8px;
	margin-top: 8px;
`;

export const VideoControls = ({
	videoBaseUrl,
	mainMediaVideoAtom,
	replacementVideoAtom,
	showMainVideo,
	showReplacementVideo,
	changeField,
	changeMediaField,
	form,
	extraVideoControlsId,
}: VideoControlsProps) => {
	const [mainMediaVideoActiveAssets, setMainMediaVideoActiveAssets] =
		React.useState<MediaAtomActiveAssets>();
	const [replacementVideoActiveAssets, setReplacementVideoActiveAssets] =
		React.useState<MediaAtomActiveAssets>();
	const [currentVideoActiveAssets, setCurrentVideoActiveAssets] =
		React.useState<MediaAtomActiveAssets>();

	const [showVideoPreviewModal, setShowVideoPreviewModal] =
		React.useState<boolean>(false);
	const [showMediaAtomMakerModal, setShowMediaAtomMakerModal] =
		React.useState<boolean>(false);
	const [confirmDelete, setConfirmDelete] = React.useState<boolean>(false);
	const [isMainVideoSelfHosted, setIsMainVideoSelfHosted] =
		React.useState<boolean>(false);
	const [isReplacementVideoSelfHosted, setIsReplacementVideoSelfHosted] =
		React.useState<boolean>(false);
	const dispatch = useDispatch();

	const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();

		if (!confirmDelete) {
			setConfirmDelete(true);
			setTimeout(() => setConfirmDelete(false), 3000);
			return;
		}

		// Redux Form needs empty strings to clear fields, not null or undefined.
		dispatch(autofill(form, 'replaceVideoUri', ''));
		dispatch(autofill(form, 'atomId', ''));
		changeMediaField('showMainVideo');
		setConfirmDelete(false);
	};

	type MessageData = {
		atomId?: string;
		eventKey?: string;
	};

	const onMessage = (event: MessageEvent) => {
		if (videoBaseUrl === null || event.origin !== videoBaseUrl) {
			return;
		}

		const data: MessageData = event.data;

		if (!data) {
			return;
		}

		if (data.atomId) {
			changeMediaField('videoReplace');
			dispatch(
				change(
					form,
					'atomId',
					`${urlConstants.video.capiMediaAtomPath}${data.atomId}`,
				),
			);
			/**
			 * Even if we can't fetch the replacement atom, it's worth setting the videoReplace and replaceVideoUri fields
			 * to give some feedback to the user.
			 *
			 * Invalid atoms can't be saved, so there should be no risk in setting these fields.
			 */
			dispatch(
				change(
					form,
					'replaceVideoUri',
					`${videoBaseUrl}/videos/${data.atomId}`,
				),
			);
			handleCloseMediaAtomMakerModal();
		}

		/*
		 * The iFrame swallows keypress events when focussed - so we propagate them
		 * up through the Message API.
		 *
		 * This allows us to handle the Escape shortcut.
		 */
		if (data.eventKey === 'Escape') {
			handleCloseMediaAtomMakerModal();
		}
	};

	const handleOpenMediaAtomMakerModal = () => {
		setShowMediaAtomMakerModal(true);
		window.addEventListener('message', onMessage, false);
	};
	const handleCloseMediaAtomMakerModal = () => {
		setShowMediaAtomMakerModal(false);
		window.removeEventListener('message', onMessage, false);
	};

	useEffect(() => {
		if (isAtom(replacementVideoAtom)) {
			const atomProperties = extractMediaAtomActiveAssets(replacementVideoAtom);
			setReplacementVideoActiveAssets(atomProperties);
		} else {
			setReplacementVideoActiveAssets({
				assetId: undefined,
				platform: undefined,
				mp4: undefined,
				m3u8: undefined,
				vtt: undefined,
				videoImage: undefined,
			});
		}
	}, [replacementVideoAtom]);

	useEffect(() => {
		if (mainMediaVideoAtom !== undefined) {
			const atomProperties = extractMediaAtomActiveAssets(mainMediaVideoAtom);
			setMainMediaVideoActiveAssets(atomProperties);
		} else {
			setMainMediaVideoActiveAssets({
				assetId: undefined,
				platform: undefined,
				mp4: undefined,
				m3u8: undefined,
				vtt: undefined,
				videoImage: undefined,
			});
		}
	}, [mainMediaVideoAtom]);

	useEffect(() => {
		setCurrentVideoActiveAssets(
			showReplacementVideo
				? replacementVideoActiveAssets
				: mainMediaVideoActiveAssets,
		);
	}, [
		showReplacementVideo,
		mainMediaVideoActiveAssets,
		replacementVideoActiveAssets,
	]);

	useEffect(() => {
		setIsReplacementVideoSelfHosted(
			showReplacementVideo &&
				isAtom(replacementVideoAtom) &&
				replacementVideoActiveAssets?.platform === 'url',
		);
	}, [
		replacementVideoAtom,
		showReplacementVideo,
		replacementVideoActiveAssets,
	]);

	useEffect(() => {
		setIsMainVideoSelfHosted(
			showMainVideo &&
				isAtom(mainMediaVideoAtom) &&
				mainMediaVideoActiveAssets?.platform === 'url',
		);
	}, [showMainVideo, mainMediaVideoAtom, mainMediaVideoActiveAssets]);

	if (!showMainVideo && !showReplacementVideo) {
		return null;
	}

	const extraVideoControls = document.getElementById(extraVideoControlsId);

	return (
		<>
			{extraVideoControls !== null &&
			(isMainVideoSelfHosted || isReplacementVideoSelfHosted)
				? createPortal(
						<Explainer>
							<LoopIcon />
							Selected video will loop
						</Explainer>,
						extraVideoControls,
					)
				: null}
			{/*
				If there is no main media atom, the replacement atom is the only one we care about.
				In this scenario we neither show the 'Use replacement video toggle', nor refer to it as a replacement.
				Note in the data model we still call this a replacement atom.
			*/}
			{extraVideoControls !== null && mainMediaVideoAtom && replacementVideoAtom
				? createPortal(
						<MarginWrapper>
							<Field
								name="useReplacementVideo"
								component={InputCheckboxToggleInline}
								label="Use replacement video"
								disabled={!isAtom(replacementVideoAtom)}
								id={`${extraVideoControlsId}-useReplacementVideo`}
								type="checkbox"
								dataTestId="use-replacement-video"
								checked={showReplacementVideo && isAtom(replacementVideoAtom)}
								onChange={() => {
									if (showReplacementVideo) {
										changeMediaField('showMainVideo');
									} else {
										changeMediaField('videoReplace');
									}
								}}
							/>
							{!isAtom(replacementVideoAtom) && (
								<Explainer>Replacement video required</Explainer>
							)}
						</MarginWrapper>,
						extraVideoControls,
					)
				: null}
			{currentVideoActiveAssets?.assetId !== undefined && showVideoPreviewModal
				? createPortal(
						currentVideoActiveAssets.platform === 'youtube' ? (
							<OverlayModal
								onClose={() => setShowVideoPreviewModal(false)}
								isOpen={showVideoPreviewModal}
								url={`https://www.youtube.com/embed/${currentVideoActiveAssets.assetId}`}
							/>
						) : (
							<OverlayModal
								onClose={() => setShowVideoPreviewModal(false)}
								isOpen={showVideoPreviewModal}
							>
								<video controls loop>
									<source
										src={currentVideoActiveAssets.assetId}
										type="video/mp4"
									/>
								</video>
							</OverlayModal>
						),
						document.body,
					)
				: null}
			{showMediaAtomMakerModal && videoBaseUrl !== null
				? createPortal(
						<OverlayModal
							onClose={handleCloseMediaAtomMakerModal}
							isOpen={showMediaAtomMakerModal}
							url={`${videoBaseUrl}/videos?embeddedMode=live`}
						/>,
						document.body,
					)
				: null}
			<VideoControlsOuterContainer>
				<VideoControlsInnerContainer
					url={
						showReplacementVideo
							? replacementVideoActiveAssets?.videoImage
							: mainMediaVideoActiveAssets?.videoImage
					}
				>
					<VideoAction
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							handleOpenMediaAtomMakerModal();
						}}
					>
						<ReplaceVideoIcon />
						Replace video
					</VideoAction>
					<VideoAction
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setShowVideoPreviewModal(true);
						}}
						disabled={currentVideoActiveAssets?.assetId === undefined}
					>
						<PreviewVideoIcon />
						Preview video
					</VideoAction>
					{showReplacementVideo && isAtom(replacementVideoAtom) && (
						<ButtonDelete
							type="button"
							priority="primary"
							onClick={handleDelete}
							confirmDelete={confirmDelete}
						>
							<DeleteIconOptions>
								{confirmDelete ? (
									<ConfirmDeleteIcon size="s" />
								) : (
									<RubbishBinIcon size="s" />
								)}
							</DeleteIconOptions>
						</ButtonDelete>
					)}
				</VideoControlsInnerContainer>
				<Field
					name="replaceVideoUri"
					component={VideoUriInput}
					type="text"
					onChange={(e: any) => {
						const videoUri = e.currentTarget.value;

						if (videoUri) {
							changeMediaField('videoReplace');
						} else {
							changeMediaField('showMainVideo');
						}

						changeField('atomId', extractAtomId(videoUri));
					}}
					placeholder="Paste video url"
					normalize={stripQueryParams}
				></Field>
			</VideoControlsOuterContainer>
		</>
	);
};
