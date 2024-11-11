interface Dimensions {
	width: number;
	height: number;
}

interface Criteria {
	minHeight?: number;
	minWidth?: number;
	widthAspectRatio?: number;
	heightAspectRatio?: number;
	maxWidth?: number;
}

interface Specification {
	uri: string;
	aspectRatio: string;
	type: string;
	bounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
}

interface ImageDetails {
	file: string;
	mimeType: string;
	secureUrl: string;
	size: number;
	dimensions: Dimensions;
}

interface Image {
	id: string;
}

interface Crop {
	id: string;
	date: string;
	assets: ImageDetails[];
	author: string;
	master: ImageDetails;
	specification: Specification;
}

interface GridData {
	image: {
		data: Image;
		uri: string;
	};
	crop: {
		data: Crop;
		uri: string;
	};
}

export { GridData, Crop, Image, ImageDetails, Criteria };
