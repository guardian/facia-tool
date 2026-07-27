import React from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { theme } from 'constants/theme';
import { OverlayModal } from '../modals/OverlayModal';
import { SelectVideoIcon } from '../icons/Icons';
import urlConstants from '../../constants/url';
import { getActiveAtomProperties } from '../../util/extractAtom';
import { isAtom } from '../../util/atom';
import type { ImageData } from 'types/Collection';

interface SlideshowVideoSlideProps {
	videoBaseUrl: string | null;
	value: ImageData | undefined;
	onChange: (value: ImageData) => void;
	isSelected: boolean;
}

const VideoSlot = styled.div<{ poster?: string; isSelected: boolean }>`
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	align-items: stretch;
	aspect-ratio: 5 / 4;
	background-color: ${theme.colors.greyLight};
	background-image: url(${(props) => props.poster ?? ''});
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
	border: 2px solid
		${(props) => (props.isSelected ? theme.colors.orange : 'transparent')};
	cursor: pointer;
`;

const EmptyLabel = styled.div`
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	gap: 4px;
	justify-content: center;
	align-items: center;
	color: ${theme.colors.greyMedium};
	font-size: 12px;
	/* The overlay covers the whole slot, so let clicks pass through to the
	   button/slot underneath (otherwise it swallows the "Add video" click). */
	pointer-events: none;
`;

const VideoAction = styled.button`
	position: relative;
	z-index: 1;
	border: none;
	background-color: #5e5e5e99;
	color: ${theme.colors.white};
	font-size: 12px;
	padding: 4px;
	width: 100%;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	gap: 4px;
	cursor: pointer;
	&:hover {
		background-color: #5e5e5ecc;
	}
`;

/**
 * A single slideshow slide that holds a video (media atom) instead of an image.
 *
 * It reuses the media-atom-maker iframe used for card-level videos: opening the
 * modal lets the user pick/create an atom, and the atom id is returned over the
 * window `message` API. We then fetch the atom from CAPI and capture its poster
 * frame so the slide can be previewed and used as a trail thumbnail.
 */
export const SlideshowVideoSlide = ({
	videoBaseUrl,
	value,
	onChange,
	isSelected,
}: SlideshowVideoSlideProps) => {
	const [showModal, setShowModal] = React.useState(false);

	const fetchPosterAndSave = async (rawAtomId: string) => {
		const atomIdPath = `${urlConstants.video.capiMediaAtomPath}${rawAtomId}`;
		const baseSlide: ImageData = {
			mediaType: 'video',
			atomId: atomIdPath,
			caption: value?.caption,
		};
		try {
			const response = await fetch(`/api/live/${atomIdPath}`);
			const data = await response.json();
			const atom = data?.response?.media;
			const poster = isAtom(atom)
				? getActiveAtomProperties(atom).videoImage
				: undefined;
			onChange({ ...baseSlide, src: poster, thumb: poster });
		} catch (error) {
			// Even if we can't hydrate the poster, still record the atom id so the
			// selection isn't lost. Invalid atoms can't be saved downstream.
			console.error(error);
			onChange(baseSlide);
		}
	};

	const onMessage = (event: MessageEvent) => {
		if (videoBaseUrl === null || event.origin !== videoBaseUrl) {
			return;
		}
		const data: { atomId?: string; eventKey?: string } = event.data;
		if (!data) {
			return;
		}
		if (data.atomId) {
			void fetchPosterAndSave(data.atomId);
			closeModal();
		}
		if (data.eventKey === 'Escape') {
			closeModal();
		}
	};

	const openModal = () => {
		setShowModal(true);
		window.addEventListener('message', onMessage, false);
	};

	const closeModal = () => {
		setShowModal(false);
		window.removeEventListener('message', onMessage, false);
	};

	return (
		<>
			{showModal && videoBaseUrl !== null
				? createPortal(
						<OverlayModal
							onClose={closeModal}
							isOpen={showModal}
							url={`${videoBaseUrl}/videos?embeddedMode=live`}
						/>,
						document.body,
					)
				: null}
			<VideoSlot
				poster={value?.src}
				isSelected={isSelected}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					openModal();
				}}
			>
				{!value?.src && (
					<EmptyLabel>
						<SelectVideoIcon />
						<span>No video</span>
					</EmptyLabel>
				)}
				<VideoAction
					type="button"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						openModal();
					}}
				>
					<SelectVideoIcon />
					{value?.atomId ? 'Replace video' : 'Add video'}
				</VideoAction>
			</VideoSlot>
		</>
	);
};
