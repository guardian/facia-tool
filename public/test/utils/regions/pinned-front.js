import $ from 'jquery';
import {type} from 'test/utils/dom-nodes';
import textInside from 'test/utils/text-inside';
import * as wait from 'test/utils/wait';
import 'widgets/config-collection-backfill.html!text';
import {default as collection, count as collectionCount} from 'test/utils/regions/config-collection';

const fieldSelectorMap = {
    'id': '.input-url-path'
};
const textSelectorMap = {};

class Pinned {
    constructor(dom) {
        this.dom = dom;
    }

    type(field, text) {
        type($(fieldSelectorMap[field], this.dom), text);
        return Promise.resolve(this);
    }

    title() {
        return textInside($('.title--text', this.dom));
    }

    field(name) {
        return textInside($(textSelectorMap[name], this.dom));
    }

    create() {
        $('.create-new-front', this.dom).click();
        return wait.ms(10).then(() => this);
    }

    createCollection() {
        $('.linky.tool--container', this.dom).click();
        return wait.ms(10).then(() => collection(collectionCount(this.dom), this.dom));
    }

    collection(num) {
        return collection(num, this.dom);
    }
}

export default function (container) {
    var dom = container.querySelector('.configPinnedFront');
    return new Pinned(dom);
}
