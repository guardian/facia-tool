import ko from 'knockout';
import _ from 'underscore';
import BaseClass from 'models/base-class';
import alert from 'utils/alert';
import mediator from 'utils/mediator';
import {validateImageSrc, validateImageEvent} from 'utils/validate-image-src';
import articleCollection from 'utils/article-collection';

const rxScriptStriper = new RegExp(/<script.*/gi);

export default class Editor extends BaseClass {
    static create(opts, article, all, defaults = {}) {
        if (opts.editable && (!article.slimEditor || opts.slimEditable)) {
            return new Editor(opts, article, all, defaults);
        }
    }

    constructor(opts, article, all, defaults) {
        super();
        var {key, type, validator} = opts;
        var meta = article.meta[key] || ko.observable(defaults.meta);
        var field = article.fields[key] || ko.observable(defaults.field);

        this.all = all;
        this.article = article;
        this.field = field;
        this.items = [];
        this.key = key;
        this.meta = meta;
        this.opts = opts;
        this.type = type;
        this.label = opts.label + (opts.labelState ? ': ' + _.result(article.state, opts.labelState) : '');
        this.dropImage = ko.observable(!!opts.dropImage);
        this.underDrag = ko.observable(false);
        this.performValidation = true;
        this.validator = validator;

        if (type === 'list') {
            this.items = _.chain(opts.length)
                .times(i => Editor.create(opts.item, this.article, all, {
                    meta: (this.article.meta[key]() || [])[i]
                }))
                .filter(Boolean)
                .each(editor => this.subscribeOn(editor.meta, () => {
                    meta(this.items.map(item => item.meta()));
                }))
                .value();
        } else if (type === 'text') {
            this.listenOn(mediator, 'ui:open', this.onUIOpen);
            this.updateText = ko.pureComputed({
                read: this.value,
                write: this.writeText,
                owner: this
            });

            if (validator && _.isFunction(this[validator.fn])) {
                this.subscribeOn(meta, () => {
                    if (this.performValidation !== false) {
                        this[validator.fn](validator.params);
                    }
                });
            }
        } else if (type === 'text-image') {
            this.updateText = ko.pureComputed({
                read: this.imageValue,
                write: this.writeImage,
                owner: this
            });
        }

        this.hasFocus = ko.observable(false).extend({ rateLimit: 150 });
        this.length = ko.pureComputed(() => {
            return opts.maxLength ? opts.maxLength - this.value().length : undefined;
        });
        this.lengthAlert = ko.pureComputed(() => {
            return opts.maxLength && this.value().length > opts.maxLength;
        });
        this.displayEditor = ko.pureComputed(this.isVisible, this);
    }

    value() {
        return this.meta() || this.field() || '';
    }

    imageValue() {
        const meta = this.meta();
        if (meta && meta.src) {
            return meta.src;
        }
        return this.field() || '';
    }

    clear() {
        this.meta(undefined);
    }

    open() {
        this.notifiyUIOpen(this.meta);
    }

    notifiyUIOpen(meta) {
        var collection = articleCollection(this.article);
        mediator.emit('ui:open', meta, this.article, this.article.front, collection);
    }

    onUIOpen(meta) {
        this.hasFocus(meta === this.meta);
    }

    isVisible() {
        var key = this.opts.visibleWhen;
        var display = key ? _.some(this.all, editor => editor.key === key && this.article.meta[editor.key]()) : true;

        display = display && (this.article.state.enableContentOverrides() || this.key === 'customKicker');
        display = display && (this.opts.ifState ? this.article.state[this.opts.ifState]() : true);
        display = display && (this.opts.omitForSupporting ? this.article.group.parentType !== 'Article' : true);

        return display;
    }

    toggle() {
        if (this.opts.singleton) {
           _.chain(this.all)
            .filter(editor => editor.singleton === this.opts.singleton && editor.key !== this.key)
            .pluck('key')
            .each(key => this.article.meta[key](false));
        }

        this.meta(!this.meta());

       _.chain(this.all)
        .filter(editor => editor.visibleWhen === this.key)
        .first(1)
        .each(editor => this.notifiyUIOpen(this.article.meta[editor.key]));
    }

    dropInEditor(element) {
        var sourceMeta = element.getData('sourceMeta');
        var params = (this.opts.validator || {}).params || {};
        var targetMethod;
        if (this.type === 'image') {
            targetMethod = 'assignToObjectElement';
        } else if (this.type === 'text') {
            targetMethod = 'assignImageToSpreadElement';
        } else if (this.type === 'text-image') {
            targetMethod = 'assignImageToObjectElement';
        }

        if (sourceMeta) {
            // Drag and drop from another editor, assume valid
            try {
                sourceMeta = JSON.parse(sourceMeta);
                this[targetMethod](params, sourceMeta, sourceMeta.origin);
            } catch (ex) {
                alert('You cannot drag that element here.');
            }
        } else {
            return validateImageEvent({dataTransfer: element}, params.options)
                .then(img => {
                    this[targetMethod](params, img, img.origin);
                }, err => {
                    this[targetMethod](params, err);
                });
        }
    }

    writeText(value) {
        this.meta(value === this.field() ? undefined : value.replace(rxScriptStriper, ''));
    }

    writeImage(value) {
        const imageSrc = this.field() === value ? undefined : value.replace(rxScriptStriper, '');
        this.validateImage(this.validator.params, imageSrc);
    }

    validateImage(params, imageSrc) {
        const imageMeta = this.article.meta[params.src];
        const image = imageSrc || imageMeta();
        const opts = params.options;

        if (image) {
            let {src, origin} = extractImageElements(image);
            return validateImageSrc(src, opts)
                .then(img => {
                    if (this.type === 'text') {
                        this.assignImageToSpreadElement(params, img, origin || src);
                    } else if (this.type === 'text-image') {
                        this.assignImageToObjectElement(params, img, origin || src);
                    }
                }, err => {
                    if (this.type === 'text') {
                        this.assignImageToSpreadElement(params, err);
                    } else if (this.type === 'text-image') {
                        this.assignImageToObjectElement(params, err);
                    }
                });
        } else {
            if (this.type === 'text') {
                this.assignImageToSpreadElement(params, null);
            } else if (this.type === 'text-image') {
                this.assignImageToObjectElement(params, null);
            }
        }
    }

    assignImageToObjectElement(params, imgOrError, origin) {
        const imageSource = this.article.meta[params.source];
        if (!imgOrError || imgOrError instanceof Error) {
            assign(this, [imageSource], [undefined]);
            this.assignImageToSpreadElement(params, imgOrError, origin);
        } else {
            assign(this, [imageSource], [{
                src: imgOrError.src,
                origin: imgOrError.origin
            }]);
            return this.assignImageToSpreadElement(params, imgOrError, origin);
        }
    }

    assignImageToSpreadElement(params, imgOrError, origin) {
        var imageSrc = this.article.meta[params.src],
            imageSrcWidth = this.article.meta[params.width],
            imageSrcHeight = this.article.meta[params.height],
            imageSrcOrigin = this.article.meta[params.origin];

        if (!imgOrError || imgOrError instanceof Error) {
            assign(this, [imageSrc, imageSrcWidth, imageSrcHeight, imageSrcOrigin], []);
            if (imgOrError) {
                alert(imgOrError);
            }
        } else {
            assign(this,
                [imageSrc, imageSrcWidth, imageSrcHeight, imageSrcOrigin],
                [imgOrError.src, imgOrError.width, imgOrError.height, origin]
            );
        }
    }

    assignToObjectElement(params, imgOrError, origin) {
        if (!imgOrError || imgOrError instanceof Error) {
            assign(this, [this.meta], []);
            if (imgOrError) {
                alert(imgOrError);
            }
        } else {
            assign(this, [this.meta],[_.extend({}, imgOrError, {
                origin: origin
            })]);
        }
    }
}

function extractImageElements(value) {
    var origin, src;
    if (value.media) {
        // This comes from drag/drop of crops
        src = value.media.file || value.origin;
        origin = value.media.origin || value.origin;
    } else if (value.origin) {
        src = value.origin;
    } else {
        src = value;
    }
    return {origin, src};
}

function assign(scope, metas, values) {
    scope.performValidation = false;
    metas.forEach((meta, index) => meta(values[index]));
    scope.performValidation = true;
}
