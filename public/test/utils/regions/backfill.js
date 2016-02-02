import $ from 'jquery';
import ko from 'knockout';
import {type} from 'test/utils/dom-nodes';
import textInside from 'test/utils/text-inside';
import * as wait from 'test/utils/wait';

export class Backfill {
    constructor(dom, parent) {
        this.dom = dom;
        this.parent = parent;
        this.component = ko.contextFor(dom.firstChild).$component;
    }

    type(text) {
        type($('.apiquery--input', this.dom), text);
        const pendingCheck = wait.event('check:complete', this.component);
        return wait.ms(10).then(() => {
            return { check: pendingCheck };
        });
    }

    status() {
        return textInside($('.queryStatusText', this.dom));
    }

    text() {
        return $('.apiquery--input', this.dom).val();
    }

    results() {
        return $('.api-query-result', this.dom).map((index, element) => {
            return $(element);
        });
    }
}

export default function (container, parent) {
    const dom = container.querySelector('config-collection-backfill');
    return new Backfill(dom, parent);
}
