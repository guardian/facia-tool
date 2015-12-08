import $ from 'jquery';
import drag from 'test/utils/drag';
import innerDroppable from 'test/utils/regions/inner-droppable';
import textInside from 'test/utils/text-inside';
import 'widgets/trail.html!text';
import 'widgets/trail-editor.html!text';

export class Trail {
    constructor(dom, parent) {
        this.dom = dom;
        this.parent = parent;
    }

    dropTo(target, alternateDrag) {
        const dropTarget = target.dropTarget();
        const dropContainer = target.dropContainer();
        const dropTragetContainer = drag.droppable(dropContainer);
        const sourceArticle = new drag.Article(this.dom);
        const sourceDraggable = this.parent.dragContainer();
        const sourceDraggableContainer = drag.droppable(sourceDraggable);

        if (sourceDraggable) {
            sourceDraggableContainer.dragstart(this.dom, sourceArticle);
            if (dropContainer !== sourceDraggable) {
                sourceDraggableContainer.dragleave(this.dom, sourceArticle);
            }
        }
        dropTragetContainer.dragover(dropTarget, sourceArticle);
        return dropTragetContainer.drop(dropTarget, sourceArticle, !!alternateDrag);
    }

    dropContainer() {
        return this.parent.dropContainer();
    }

    dropTarget() {
        return this.dom;
    }

    open() {
        return new Promise(resolve => {
            $('.article', this.dom).click();
            // Knockout takes time to apply bindings
            setTimeout(() => {
                resolve(this);
            }, 50);
        });
    }

    toggleMetadata(name) {
        $('.editor--boolean--' + name, this.dom).click();
        return Promise.resolve(this);
    }

    isMetadataSelected(name) {
        return $('.editor--boolean--' + name).hasClass('selected');
    }

    save() {
        $('.tool--done', this.dom).click();
        return Promise.resolve(this);
    }

    remove() {
        $('.tool--small--remove', this.dom).click();
        return Promise.resolve(this);
    }

    innerDroppable() {
        return innerDroppable(this.dom, this);
    }

    copy() {
        $('.tool--small--copy', this.dom).click();
        return Promise.resolve(this);
    }

    copyToClipboard() {
        $('.tool--small--copy-to-clipboard', this.dom).click();
        return Promise.resolve(this);
    }

    paste() {
        $('.tool--small--paste', this.dom).click();
        return Promise.resolve(this);
    }

    pasteOver() {
        $('.pasteOver', this.dom).click();
        return Promise.resolve(this);
    }

    field(name) {
        return $('.element__' + name, this.dom)[0];
    }

    type(field, text) {
        $(this.field(field)).click().val(text).change();
        return Promise.resolve(this);
    }

    fieldText(name) {
        return textInside(this.field(name));
    }

    close() {
        $('.tool--cancel', this.dom).click();
        // Return null because `this` trail gets disposed after close
        return Promise.resolve(null);
    }

    openLink() {
        $('.tool--small--href', this.dom).click();
        return Promise.resolve(this);
    }

    opacity() {
        return Number($('.article', this.dom).css('opacity'));
    }

    sublink(number = 1) {
        const dom = this.dom.querySelectorAll('.supporting trail-widget')[number - 1];
        return new Trail(dom, this);
    }

    thumbUrl() {
        return $('.thumb', this.dom).css('background-image');
    }
}

export default function (number = 1, container, parent) {
    const dom = container.querySelectorAll('trail-widget')[number - 1];
    return new Trail(dom, parent);
}

export function count (container) {
    return container.querySelectorAll('trail-widget').length;
}
