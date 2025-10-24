import CONST from 'constants/defaults';

export default Object.freeze([
    {
        key: 'headline',
        editable: true,
        slimEditable: true,
        ifState: 'enableContentOverrides',
        label: 'headline',
        type: 'text',
        maxLength: 120
    },
    {
        key: 'trailText',
        editable: true,
        ifState: 'enableContentOverrides',
        omitForSupporting: true,
        label: 'trail text',
        type: 'text'
    },
    {
        key: 'byline',
        editable: true,
        ifState: 'enableContentOverrides',
        visibleWhen: 'showByline',
        omitForSupporting: true,
        label: 'byline',
        type: 'text'
    },
    {
        key: 'customKicker',
        editable: true,
        visibleWhen: 'showKickerCustom',
        label: 'custom kicker',
        type: 'text'
    },
    {
        key: 'href',
        label: 'special link URL',
        type: 'text'
    },
    {
        key: 'blockId',
        label: 'blockId',
        type: 'text'
    },
    {
        key: 'imageSrc',
        editable: true,
        dropImage: true,
        omitForSupporting: true,
        visibleWhen: 'imageReplace',
        label: 'replacement image URL',
        validator: {
            fn: 'validateImage',
            params: {
                src: 'imageSrc',
                width: 'imageSrcWidth',
                height: 'imageSrcHeight',
                origin: 'imageSrcOrigin',
                imageSrcThumb: 'imageSrcThumb',
                options: {
                    minWidth: 400,
                    widthAspectRatio: 5,
                    heightAspectRatio: 4
                }
            }
        },
        type: 'text'
    },
    {
        key: 'imageSrcThumb',
        label: 'image thumbnail',
        type: 'text'
    },
    {
        key: 'imageSrcWidth',
        visibleWhen: 'imageReplace',
        label: 'replacement image width',
        type: 'text'
    },
    {
        key: 'imageSrcHeight',
        visibleWhen: 'imageReplace',
        label: 'replacement image height',
        type: 'text'
    },
    {
        key: 'imageSrcOrigin',
        visibleWhen: 'imageReplace',
        label: 'replacement image origin',
        type: 'text'
    },
    {
        key: 'imageCutoutSrc',
        editable: true,
        dropImage: true,
        omitForSupporting: true,
        visibleWhen: 'imageCutoutReplace',
        label: 'replacement cutout image URL',
        validator: {
            fn: 'validateImage',
            params: {
                src: 'imageCutoutSrc',
                width: 'imageCutoutSrcWidth',
                height: 'imageCutoutSrcHeight',
                origin: 'imageCutoutSrcOrigin',
                options: {
                    maxWidth: 1000,
                    minWidth: 400
                }
            }
        },
        type: 'text'
    },
    {
        key: 'imageCutoutSrcWidth',
        visibleWhen: 'imageCutoutReplace',
        label: 'replacement cutout image width',
        type: 'text'
    },
    {
        key: 'imageCutoutSrcHeight',
        visibleWhen: 'imageCutoutReplace',
        label: 'replacement cutout image height',
        type: 'text'
    },
    {
        key: 'imageCutoutSrcOrigin',
        visibleWhen: 'imageCutoutReplace',
        label: 'replacement cutout image origin',
        type: 'text'
    },
    {
        key: 'isBreaking',
        editable: true,
        singleton: 'kicker',
        label: 'breaking news',
        type: 'boolean'
    },
    {
        key: 'isBoosted',
        editable: true,
        omitForSupporting: true,
        ifState: 'inDynamicCollection',
        label: 'boost',
        type: 'boolean'
    },
    {
        key: 'boostLevel',
        editable: true,
        omitForSupporting: true,
        ifState: 'inFlexibleCollection',
        label: 'boost level',
        type: 'string'
    },
    {
        key: 'isImmersive',
        editable: true,
        omitForSupporting: true,
        ifState: 'inFlexibleGeneralCollection',
        label: 'immersive',
        type: 'boolean'
    },
    {
        key: 'showLivePlayable',
        editable: true,
        omitForSupporting: true,
        ifState: 'isLiveBlog',
        label: 'show updates',
        type: 'boolean'
    },
    {
        key: 'showMainVideo',
        editable: true,
        omitForSupporting: true,
        ifState: 'hasMainVideo',
        singleton: 'images',
        label: 'show video',
        type: 'boolean'
    },
    {
        key: 'showLargeHeadline',
        editable: true,
        omitForSupporting: true,
        label: 'large headline',
        type: 'boolean'
    },
    {
        key: 'showQuotedHeadline',
        editable: true,
        omitForSupporting: true,
        label: 'quote headline',
        type: 'boolean'
    },
    {
        key: 'showByline',
        editable: true,
        omitForSupporting: true,
        label: 'byline',
        type: 'boolean'
    },
    {
        key: 'imageCutoutReplace',
        editable: true,
        omitForSupporting: true,
        singleton: 'images',
        label: 'cutout image',
        type: 'boolean'
    },
    {
        key: 'imageReplace',
        editable: true,
        omitForSupporting: true,
        singleton: 'images',
        label: 'replace image',
        omitIfNo: 'imageSrc',
        type: 'boolean'
    },
    {
        key: 'imageHide',
        editable: true,
        omitForSupporting: true,
        singleton: 'images',
        label: 'hide image',
        type: 'boolean'
    },
    {
        key: 'showKickerTag',
        editable: true,
        singleton: 'kicker',
        label: 'kicker',
        labelState: 'primaryTag',
        type: 'boolean'
    },
    {
        key: 'showKickerSection',
        editable: true,
        singleton: 'kicker',
        label: 'kicker',
        labelState: 'sectionName',
        type: 'boolean'
    },
    {
        key: 'showKickerCustom',
        editable: true,
        singleton: 'kicker',
        label: 'custom kicker',
        labelMeta: 'customKicker',
        type: 'boolean'
    },
    {
        key: 'snapUri',
        label: 'snap target',
        type: 'text'
    },
    {
        key: 'snapType',
        label: 'snap type',
        type: 'text'
    },
    {
        key: 'snapCss',
        label: 'snap class',
        type: 'text'
    },
    {
        key: 'imageSlideshowReplace',
        omitForSupporting: true,
        editable: true,
        label: 'slideshow',
        singleton: 'images',
        type: 'boolean'
    },
    {
        key: 'slideshow',
        editable: true,
        omitForSupporting: true,
        visibleWhen: 'imageSlideshowReplace',
        type: 'list',
        length: CONST.maxSlideshowImages,
        item: {
            type: 'image',
            editable: true,
            dropImage: true,
            validator: {
                params: {
                    options: {
                        minWidth: 400,
                        widthAspectRatio: 5,
                        heightAspectRatio: 3
                    }
                }
            }
        }
    }
]);
