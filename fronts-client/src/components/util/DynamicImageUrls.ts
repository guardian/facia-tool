export function imageUrlFromTemplate(
	templateString: string | undefined,
	params?: { width?: number; quality?: number },
): string | undefined {
	const quality = params?.quality;
	const width = params?.width;

	if (quality && (quality < 60 || quality > 100)) {
		throw new RangeError('quality must be in the range 60 to 100 (percent)');
	}
	if (width && (width < 10 || width > 4096)) {
		throw new RangeError('width must be in the range 10 to 4096 (pixels)');
	}
	if (templateString) {
		return templateString
			.replace('#{width}', width ? width.toString() : '420')
			.replace('#{quality}', quality ? quality.toString() : '80');
	} else {
		return undefined;
	}
}
