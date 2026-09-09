import React from 'react';
import { TextInput } from '@guardian/stand/TextInput';
import { ImageBreakpoint, SubnavImage, SubnavImagePlatform } from './types';
import {
	ImageBreakpointCard,
	ImageBreakpointGrid,
	ImageBreakpointLabel,
	ImagePlatformGroup,
	ImagePlatformGroupHeading,
	ImagePreview,
	ImagePreviewEmpty,
} from './styles';

interface PlatformGroup {
	id: string;
	label: string;
	platforms: SubnavImagePlatform[];
}

// The platform value is derived from the group an image is entered under.
const platformGroups: PlatformGroup[] = [
	{ id: 'webAndroid', label: 'Web & Android', platforms: ['web', 'android'] },
	{ id: 'ios', label: 'iOS', platforms: ['ios'] },
];

interface BreakpointSpec {
	id: ImageBreakpoint;
	// Dimension hint shown to editors; widths are the standard Guardian breakpoints.
	label: string;
}

const breakpointSpecs: BreakpointSpec[] = [
	{ id: 'mobile', label: '320 x 210' },
	{ id: 'mobileMedium', label: '375 x 210' },
	{ id: 'mobileLandscape', label: '480 x 210' },
	{ id: 'phablet', label: '660 x 210' },
	{ id: 'tablet', label: '740 x 140' },
	{ id: 'desktop', label: '980 x 140' },
	{ id: 'leftCol', label: '1140 x 140' },
	{ id: 'wide', label: '1300 x 140' },
];

const samePlatforms = (a: SubnavImagePlatform[], b: SubnavImagePlatform[]) =>
	a.length === b.length && a.every((platform) => b.includes(platform));

interface SubnavImagesSectionProps {
	images: SubnavImage[];
	onChange: (images: SubnavImage[]) => void;
}

const SubnavImagesSection = ({
	images,
	onChange,
}: SubnavImagesSectionProps) => {
	const findIndex = (group: PlatformGroup, breakpoint: ImageBreakpoint) =>
		images.findIndex(
			(image) =>
				image.breakpoint === breakpoint &&
				samePlatforms(image.platforms, group.platforms),
		);

	const setImageSrc = (
		group: PlatformGroup,
		breakpoint: ImageBreakpoint,
		value: string,
	) => {
		const src = value.trim();
		const existingIndex = findIndex(group, breakpoint);

		if (!src) {
			if (existingIndex === -1) {
				return;
			}
			onChange(images.filter((_, index) => index !== existingIndex));
			return;
		}

		if (existingIndex === -1) {
			onChange([
				...images,
				{ imageSrc: src, breakpoint, platforms: group.platforms },
			]);
			return;
		}

		onChange(
			images.map((image, index) =>
				index === existingIndex ? { ...image, imageSrc: src } : image,
			),
		);
	};

	return (
		<>
			{platformGroups.map((group) => (
				<ImagePlatformGroup key={group.id}>
					<ImagePlatformGroupHeading>{group.label}</ImagePlatformGroupHeading>
					<ImageBreakpointGrid>
						{breakpointSpecs.map((spec) => {
							const index = findIndex(group, spec.id);
							const src = index === -1 ? '' : images[index].imageSrc;
							return (
								<ImageBreakpointCard key={spec.id}>
									<ImageBreakpointLabel>{spec.label}</ImageBreakpointLabel>
									{src ? (
										<ImagePreview
											src={src}
											alt={`${group.label} ${spec.label}`}
										/>
									) : (
										<ImagePreviewEmpty>No image</ImagePreviewEmpty>
									)}
									<TextInput
										aria-label={`${group.label} ${spec.label} image URL`}
										fluid
										value={src}
										onChange={(nextValue) =>
											setImageSrc(group, spec.id, nextValue)
										}
										placeholder="Paste image URL"
									/>
								</ImageBreakpointCard>
							);
						})}
					</ImageBreakpointGrid>
				</ImagePlatformGroup>
			))}
		</>
	);
};

export default SubnavImagesSection;
