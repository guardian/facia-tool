export function thumbnail() {
    const meta = this.meta,
        fields = this.fields,
        state = this.state,
        isReplacingImage = meta.imageReplace(),
        metaImageSrcThumb = isReplacingImage && meta.imageSrcThumb(),
        imageSrc = isReplacingImage && meta.imageSrc();

    if (metaImageSrcThumb && metaImageSrcThumb !== ''){
      return metaImageSrcThumb;
    } else if (imageSrc) {
        return imageSrc;
    } else if (meta.imageCutoutReplace()) {
        return meta.imageCutoutSrc() || state.imageCutoutSrcFromCapi() || fields.secureThumbnail() || fields.thumbnail();
    } else if (meta.imageSlideshowReplace && meta.imageSlideshowReplace() && meta.slideshow() && meta.slideshow()[0]) {
        return meta.slideshow()[0].src;
    } else {
        return fields.secureThumbnail() || fields.thumbnail();
    }
}

export function main() {
    const meta = this.meta,
        fields = this.fields,
        state = this.state;

    if (meta.imageReplace() && meta.imageSrc()) {
        return meta.imageSrc();
    } else if (meta.imageCutoutReplace()) {
        return meta.imageCutoutSrc() || state.imageCutoutSrcFromCapi() || fields.secureThumbnail() || fields.thumbnail();
    } else if (meta.imageSlideshowReplace && meta.imageSlideshowReplace() && meta.slideshow() && meta.slideshow()[0]) {
        return meta.slideshow()[0].src;
    } else if (state.imageSrcFromCapi()) {
        return state.imageSrcFromCapi().href;
    } else {
        return fields.secureThumbnail() || fields.thumbnail();
    }
}
