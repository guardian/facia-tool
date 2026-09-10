import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectGridUrl } from 'selectors/configSelectors';
import { OverlayModal } from 'components/modals/OverlayModal';
import ButtonDefault from 'components/inputs/ButtonDefault';
import {
	dragEventHasImageData,
	validateImageEvent,
	validateImageSrc,
	validateMediaItem,
} from 'util/validateImageSrc';
import { GridData } from 'types/Grid';
import {
	ImageEmpty,
	ImagePicker,
	ImagePickerActions,
	ImageThumb,
	TextInput,
} from './styles';

// Used only for Grid usage-recording / analytics on the shared validators.
const FRONT_ID = 'custom-subnav';

interface SubnavImageInputProps {
	value?: string;
	onChange: (src: string | undefined) => void;
	disabled?: boolean;
}

/**
 * A controlled image picker that mirrors the fronts "replace image" flow:
 * pick/crop an image in the Grid (opened in a modal), drag a Grid image in, or
 * paste a Grid crop URL. The resulting crop `src` is stored as the imageSrc.
 */
const SubnavImageInput = ({
	value,
	onChange,
	disabled,
}: SubnavImageInputProps) => {
	const gridUrl = useSelector(selectGridUrl);
	const [modalOpen, setModalOpen] = useState(false);
	const [isValidating, setIsValidating] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [pasteUrl, setPasteUrl] = useState('');

	useEffect(() => {
		if (!modalOpen || !gridUrl) {
			return;
		}
		const onMessage = (event: MessageEvent) => {
			if (event.origin !== gridUrl) {
				return;
			}
			const data: GridData = event.data;
			if (!data || !data.crop?.data || !data.image?.data) {
				return;
			}
			setModalOpen(false);
			const imageOrigin = `${gridUrl}/images/${data.image.data.id}`;
			setIsValidating(true);
			validateMediaItem(data.crop.data, imageOrigin, FRONT_ID)
				.then((mediaItem) => onChange(mediaItem.src))
				.catch((err) => window.alert(err))
				.finally(() => setIsValidating(false));
		};
		window.addEventListener('message', onMessage, false);
		return () => window.removeEventListener('message', onMessage, false);
	}, [modalOpen, gridUrl, onChange]);

	if (!gridUrl) {
		return <ImageEmpty>Grid URL config missing</ImageEmpty>;
	}

	const gridModalUrl = `${gridUrl}?${new URLSearchParams({
		cropType: 'portrait,landscape',
	}).toString()}`;

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		setIsValidating(true);
		validateImageEvent(e, FRONT_ID)
			.then((mediaItem) => onChange(mediaItem.src))
			.catch((err) => window.alert(err))
			.finally(() => setIsValidating(false));
	};

	const handlePaste = () => {
		const trimmed = pasteUrl.trim();
		if (!trimmed) {
			return;
		}
		setIsValidating(true);
		validateImageSrc(trimmed, FRONT_ID)
			.then((mediaItem) => {
				onChange(mediaItem.src);
				setPasteUrl('');
			})
			.catch((err) => window.alert(err))
			.finally(() => setIsValidating(false));
	};

	return (
		<ImagePicker>
			<OverlayModal
				url={gridModalUrl}
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
			/>
			{value ? (
				<ImageThumb style={{ backgroundImage: `url(${value})` }} />
			) : (
				<ImageEmpty
					isDragging={isDragging}
					onDragOver={(e) => {
						if (dragEventHasImageData(e)) {
							e.preventDefault();
							setIsDragging(true);
						}
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={handleDrop}
				>
					{isValidating
						? 'Validating…'
						: 'Drag a Grid image here, or use the options below'}
				</ImageEmpty>
			)}
			<ImagePickerActions>
				<ButtonDefault
					type="button"
					size="s"
					disabled={disabled || isValidating}
					onClick={() => setModalOpen(true)}
				>
					{value ? 'Replace image' : 'Add image from Grid'}
				</ButtonDefault>
				{value && (
					<ButtonDefault
						type="button"
						size="s"
						priority="muted"
						disabled={disabled}
						onClick={() => onChange(undefined)}
					>
						Remove
					</ButtonDefault>
				)}
			</ImagePickerActions>
			{!value && (
				<ImagePickerActions>
					<TextInput
						value={pasteUrl}
						onChange={(e) => setPasteUrl(e.target.value)}
						placeholder="…or paste a Grid crop URL"
						disabled={disabled}
					/>
					<ButtonDefault
						type="button"
						size="s"
						disabled={disabled || isValidating || !pasteUrl.trim()}
						onClick={handlePaste}
					>
						Use URL
					</ButtonDefault>
				</ImagePickerActions>
			)}
		</ImagePicker>
	);
};

export default SubnavImageInput;
