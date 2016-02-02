import $ from 'jquery';
import {type} from 'test/utils/dom-nodes';
import backfill from 'test/utils/regions/backfill';
import * as wait from 'test/utils/wait';
import 'widgets/config-collection-backfill.html!text';

const fieldSelectorMap = {
    'title': '.title--input'
};

class Collection {
    constructor(dom) {
        this.dom = dom;
    }

    type(field, text) {
        type($(fieldSelectorMap[field], this.dom), text);
        return Promise.resolve(this);
    }

    toggle(id) {
        $('#' + id, this.dom).click();
        return Promise.resolve(this);
    }

    backfill() {
        return backfill(this.dom, this);
    }

    chooseLayout(index) {
        $('.type-option-chosen', this.dom).click();
        $('.type-option-value:nth(' + index + ')', this.dom).click();
        return wait.ms(10).then(() => this);
    }

    open() {
        $('.cnf-collection__name', this.dom).click();
        return wait.ms(10).then(() => this);
    }

    save() {
        $('.tool-save-container', this.dom).click();
        return Promise.resolve(this);
    }

    remove() {
        $('.tool--rhs', this.dom).click();
        return Promise.resolve(this);
    }
}

export default function (number = 1, container) {
    var dom = container.querySelectorAll('.cnf-collection')[number - 1];
    return new Collection(dom);
}

export function count (container) {
    return container.querySelectorAll('.cnf-collection').length;
}
