import type { ImageDescription } from './validateImageSrc';

function fetchImage(description: ImageDescription): Promise<ImageDescription> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onerror = () => {
			reject(new Error('That image could not be found'));
		};
		img.onload = () => {
			const size = {
				width: img.width,
				height: img.height,
				ratio: img.width / img.height,
			};
			const asset: ImageDescription = {
				...description,
				...size,
			};
			resolve(asset);
		};
		img.src = description.path;
	});
}

export default fetchImage;
