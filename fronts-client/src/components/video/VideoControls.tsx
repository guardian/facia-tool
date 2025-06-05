import React, { useEffect } from 'react';
import styled from 'styled-components';
import ButtonDefault from '../inputs/ButtonDefault';
import { createPortal } from 'react-dom';
import {
	ConfirmDeleteIcon,
	PreviewVideoIcon,
	ReplaceVideoIcon,
	RubbishBinIcon,
} from '../icons/Icons';
import InputCheckboxToggleInline from '../inputs/InputCheckboxToggleInline';
import { autofill, change, Field } from 'redux-form';
import {
	AtomProperties,
	extractAtomId,
	extractAtomProperties,
	getVideoUri,
	stripQueryParams,
} from '../../util/extractAtomId';
import { ButtonDelete, DeleteIconOptions } from '../inputs/InputImage';
import { VideoUriInput } from '../inputs/VideoUriInput';
import { useDispatch } from 'react-redux';
import Explainer from '../Explainer';
import { OverlayModal } from '../modals/OverlayModal';
import { InvalidWarning } from '../form/ArticleMetaForm';
import type { Atom } from '../../types/Capi';
import urlConstants from '../../constants/url';

interface VideoControlsProps {
	videoBaseUrl: string | null;
	mainMediaVideoAtom: Atom | undefined;
	replacementVideoAtom: Atom | undefined;
	showMainVideo: boolean;
	showReplacementVideo: boolean;
	changeField: (field: string, value: any) => void;
	changeMediaField: (fieldToSet: string) => void;
	form: any;
	replacementVideoControlsId: string;
	warningsContainerId: string;
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
	replacementVideoControlsId,
	warningsContainerId,
}: VideoControlsProps) => {
	const [mainMediaVideoAtomProperties, setMainMediaVideoAtomProperties] =
		React.useState<AtomProperties>();
	const [replacementVideoAtomProperties, setReplacementVideoAtomProperties] =
		React.useState<AtomProperties>();

	const [currentVideoUri, setCurrentVideoUri] = React.useState<
		string | undefined
	>(undefined);
	const [showVideoPreviewModal, setShowVideoPreviewModal] =
		React.useState<boolean>(false);
	const [showMediaAtomMakerModal, setShowMediaAtomMakerModal] =
		React.useState<boolean>(false);
	const [confirmDelete, setConfirmDelete] = React.useState<boolean>(false);
	const dispatch = useDispatch();

	const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();

		if (!confirmDelete) {
			setConfirmDelete(true);
			setTimeout(() => setConfirmDelete(false), 3000);
			return;
		}

		// This exact incantation is needed to clear the form fields...
		dispatch(autofill(form, 'replaceVideoUri', undefined));
		dispatch(autofill(form, 'atomId', undefined));
		dispatch(change(form, 'replacementVideoAtom', undefined));
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
			changeMediaField('videoReplace');
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
		if (replacementVideoAtom !== undefined) {
			const atomProperties = extractAtomProperties(replacementVideoAtom);
			setReplacementVideoAtomProperties(atomProperties);
		}
	}, [replacementVideoAtom]);

	useEffect(() => {
		if (mainMediaVideoAtom !== undefined) {
			const atomProperties = extractAtomProperties(mainMediaVideoAtom);
			setMainMediaVideoAtomProperties(atomProperties);
		}
	}, [mainMediaVideoAtom]);

	useEffect(() => {
		const videoUri = showReplacementVideo
			? getVideoUri(replacementVideoAtomProperties)
			: getVideoUri(mainMediaVideoAtomProperties);

		setCurrentVideoUri(videoUri);
	}, [
		showReplacementVideo,
		mainMediaVideoAtomProperties,
		replacementVideoAtomProperties,
	]);

	if (!showMainVideo && !showReplacementVideo) {
		return null;
	}

	const replacementVideoControls = document.getElementById(
		replacementVideoControlsId,
	);

	const warningsContainer = document.getElementById(warningsContainerId);

	const mainMediaIsSelfHosted =
		showMainVideo &&
		mainMediaVideoAtom !== null &&
		mainMediaVideoAtomProperties?.platform === 'url';

	const replacementVideoIsSelfHosted =
		showReplacementVideo &&
		replacementVideoAtom !== null &&
		replacementVideoAtomProperties?.platform === 'url';

	return (
		<>
			{/*
				If there is no main media atom, the replacement atom is the only one we care about.
				In this scenario we neither show the 'Use replacement video toggle', nor refer to it as a replacement.
				Note in the data model we still call this a replacement atom.
			*/}
			{replacementVideoControls !== null && mainMediaVideoAtom
				? createPortal(
						<MarginWrapper>
							<Field
								name="useReplacementVideo"
								component={InputCheckboxToggleInline}
								label="Use replacement video"
								disabled={!replacementVideoAtom}
								id={`${replacementVideoControlsId}-useReplacementVideo`}
								type="checkbox"
								dataTestId="use-replacement-video"
								checked={
									showReplacementVideo && replacementVideoAtom !== undefined
								}
								onChange={() => {
									if (showReplacementVideo) {
										changeMediaField('showMainVideo');
									} else {
										changeMediaField('videoReplace');
									}
								}}
							/>
							{!replacementVideoAtom && (
								<Explainer>Replacement video required</Explainer>
							)}
						</MarginWrapper>,
						replacementVideoControls,
					)
				: null}
			{currentVideoUri !== undefined && showVideoPreviewModal
				? createPortal(
						<OverlayModal
							onClose={() => setShowVideoPreviewModal(false)}
							isOpen={showVideoPreviewModal}
							url={currentVideoUri}
						/>,
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
							? replacementVideoAtomProperties?.videoImage
							: mainMediaVideoAtomProperties?.videoImage
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
						disabled={currentVideoUri === undefined}
					>
						<PreviewVideoIcon />
						Preview video
					</VideoAction>
					{showReplacementVideo && replacementVideoAtom && (
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
			{warningsContainer !== null &&
			(mainMediaIsSelfHosted || replacementVideoIsSelfHosted)
				? createPortal(
						<InvalidWarning warning="Self-hosted videos are not supported" />,
						warningsContainer,
					)
				: null}
		</>
	);
};
