export default Object.freeze([{
    key: 'one',
    label: 'one',
    type: 'boolean',
    singleton: 'common',
    editable: true
}, {
    key: 'two',
    label: 'two',
    type: 'boolean',
    singleton: 'common',
    editable: true
}, {
    key: 'three',
    label: 'three',
    type: 'boolean',
    singleton: 'common',
    editable: true
}, {
    key: 'field',
    label: 'field',
    type: 'text',
    visibleWhen: 'one',
    editable: true,
    maxLength: 5
}, {
    key: 'image',
    label: 'image',
    type: 'text',
    editable: true,
    dropImage: true,
    validator: {
        fn: 'validateImage',
        params: {
            src: 'image',
            width: 'imageWidth',
            height: 'imageHeight',
            origin: 'imageOrigin',
            imageSrcThumb: 'imageSrcThumb'
        }
    }
}, {
    key: 'imageWidth',
    type: 'text',
    editable: false,
    visibleWhen: 'image'
}, {
    key: 'imageHeight',
    type: 'text',
    editable: false,
    visibleWhen: 'image'
}, {
    key: 'imageOrigin',
    type: 'text',
    editable: false,
    visibleWhen: 'image'
}, {
    key: 'imageSrcThumb',
    label: 'image thumbnail',
    type: 'text'
}, {
    key: 'list',
    type: 'list',
    editable: true,
    length: 3,
    item: {
        type: 'image',
        editable: true,
        dropImage: true
    }
}]);
