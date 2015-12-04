import $ from 'jquery';
import textInside from 'test/utils/text-inside';
import group from 'test/utils/regions/group';
import 'widgets/collection.html!text';

class Collection {
    constructor(dom, parent) {
        this.dom = dom;
        this.parent = parent;
    }

    group(number) {
        return group(number, this.dom, this);
    }

    dragContainer() {
        return this.group(1).dragContainer();
    }

    dropContainer() {
        return this.group(1).dropContainer();
    }

    dropTarget() {
        return this.group(1).dropTarget();
    }

    publish() {
        $('.draft-publish', this.dom).click();
        return Promise.resolve(this);
    }

    lastModified() {
        return textInside($('.list-header__timings', this.dom));
    }
}

export default function (number = 1, container, parent) {
    var dom = container.querySelectorAll('collection-widget')[number - 1];
    return new Collection(dom, parent);
}
