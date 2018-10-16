export default class ImageMock {
  static defaultLoadDelay = 100;
  static defaultWidth: number = 100;
  static defaultHeight: number = 100;
  static shouldError: boolean = false;
  width: void | number = undefined;
  height: void | number = undefined;
  src: void | string = undefined;
  constructor() {
    this.width = ImageMock.defaultWidth;
    this.height = ImageMock.defaultHeight;
    setTimeout(
      () => (ImageMock.shouldError ? this.onerror() : this.onload()),
      ImageMock.defaultLoadDelay
    );
  }
  static restoreDefaults() {
    ImageMock.defaultWidth = 100;
    ImageMock.defaultHeight = 100;
    ImageMock.defaultLoadDelay = 100;
    ImageMock.shouldError = false;
  }
  onload = () => {};
  onerror = () => {};
}
