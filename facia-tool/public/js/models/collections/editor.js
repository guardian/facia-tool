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

        this.hasFocus = ko.observable(false);
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
                this[validator.fn](validator.params, meta);
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

        display = display && (this.article.state.enableContentOverrides() || key === 'customKicker');
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
            image = imageSrc(),
            src,
            opts = params.options;


        if (image) {
            src = typeof image === 'string' ? image : (image.media ? image.media.file || image.origin : image.origin);
            return validateImageSrc(src, opts)
                .then(function(img) {
                    imageSrc(img.src);
                    imageSrcWidth(img.width);
                    imageSrcHeight(img.height);
                }, function(err) {
                    [imageSrc, imageSrcWidth, imageSrcHeight].forEach(m => m(undefined));
                    alert(err.message);
                });
        } else {
            [imageSrc, imageSrcWidth, imageSrcHeight].forEach(m => m(undefined));
        }
    }

    validateListImage(params = {}, meta) {
        var image = meta();

        if (image && image.src) {
            // This image is already validated
            return;
        } else if (image) {
            var originUrl = image.origin,
                src = image.media ? image.media.file || originUrl : originUrl,
                origin = image.media ? image.media.origin || originUrl : originUrl;
            return validateImageSrc(src, params.options)
                .then(function(img) {
                    meta(_.extend({
                        origin: origin
                    }, img));
                }, function(err) {
                    meta(undefined);
                    alert(err);
                });
        } else {
            meta(undefined);
        }
    }
}
