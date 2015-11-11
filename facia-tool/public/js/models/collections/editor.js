import ko from 'knockout';
import _ from 'underscore';
import BaseClass from 'models/base-class';
import alert from 'utils/alert';
import * as draggableElement from 'utils/draggable-element';
import mediator from 'utils/mediator';
import validateImageSrc from 'utils/validate-image-src';

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
        }

        this.hasFocus = ko.observable(false).extend({ rateLimit: 150 });
        this.length = ko.pureComputed(() => {
            return opts.maxLength ? opts.maxLength - this.value().length : undefined;
        });
        this.lengthAlert = ko.pureComputed(() => {
            return opts.maxLength && this.value().length > opts.maxLength;
        });
        this.displayEditor = ko.pureComputed(this.isVisible, this);
        this.updateText = ko.pureComputed({
            read: this.value,
            write: this.writeText,
            owner: this
        });

        if (validator && _.isFunction(this[validator.fn])) {
            this.subscribeOn(meta, () => {
                if (this.performValidation !== false) {
                    this[validator.fn](validator.params, meta);
                }
            });
        }
    }

    value() {
        return this.meta() || this.field() || '';
    }

    clear() {
        this.meta(undefined);
    }

    open() {
        this.notifiyUIOpen(this.meta);
    }

    notifiyUIOpen(meta) {
        mediator.emit('ui:open', meta, this.article, this.article.front);
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
        if (sourceMeta) {
            try {
                sourceMeta = JSON.parse(sourceMeta);
                this.meta(sourceMeta);
                return;
            } catch (ex) {/**/}
        }

        try {
            this.meta({
                media: draggableElement.getMediaItem(element),
                origin: element.getData('Url')
            });
        } catch (ex) {
            alert(ex.message);
        }
    }

    writeText(value) {
        this.meta(value === this.field() ? undefined : value.replace(rxScriptStriper, ''));
    }

    validateImage(params) {
        var imageSrc = this.article.meta[params.src],
            imageSrcWidth = this.article.meta[params.width],
            imageSrcHeight = this.article.meta[params.height],
            imageSrcOrigin = this.article.meta[params.origin],
            image = imageSrc(),
            opts = params.options;


        if (image) {
            let {src, origin} = extractImageElements(image);
            return validateImageSrc(src, opts)
                .then(img => {
                    assign(this,
                        [imageSrc, imageSrcWidth, imageSrcHeight, imageSrcOrigin],
                        [img.src, img.width, img.height, origin || src]
                    );
                }, err => {
                    assign(this, [imageSrc, imageSrcWidth, imageSrcHeight, imageSrcOrigin], []);
                    alert(err.message);
                });
        } else {
            assign(this, [imageSrc, imageSrcWidth, imageSrcHeight, imageSrcOrigin], []);
        }
    }

    validateListImage(params = {}, meta) {
        var image = meta();

        if (image && image.src) {
            // This image is already validated
            return;
        } else if (image) {
            let {src, origin} = extractImageElements(image);
            return validateImageSrc(src, params.options)
                .then(img => {
                    assign(this, [meta], [_.extend({}, img, {
                        origin: origin
                    })]);
                }, err => {
                    assign(this, [meta], []);
                    alert(err);
                });
        } else {
            assign(this, [meta], []);
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
