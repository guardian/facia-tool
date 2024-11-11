export default class ImageMock {
	public static defaultLoadDelay = 100;
	public static defaultWidth: number = 100;
	public static defaultHeight: number = 100;
	public static shouldError: boolean = false;
	public static restoreDefaults() {
		ImageMock.defaultWidth = 100;
		ImageMock.defaultHeight = 100;
		ImageMock.defaultLoadDelay = 100;
		ImageMock.shouldError = false;
	}
	public width: void | number = undefined;
	public height: void | number = undefined;
	public src: void | string = undefined;
	constructor() {
		this.width = ImageMock.defaultWidth;
		this.height = ImageMock.defaultHeight;
		setTimeout(
			() => (ImageMock.shouldError ? this.onerror() : this.onload()),
			ImageMock.defaultLoadDelay,
		);
	}
	public onload = () => {};
	public onerror = () => {};
}
