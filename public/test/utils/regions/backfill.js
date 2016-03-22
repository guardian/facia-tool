import $ from 'jquery';
import ko from 'knockout';
import {type} from 'test/utils/dom-nodes';
import drag from 'test/utils/drag';
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

    resultText(position) {
        return textInside($('.api-query-result', this.dom)[position - 1]);
    }

    drop(source) {
        const droppableContainer = drag.droppable(this.dom);
        const apiInput = $('.apiquery--input:visible', this.dom);
        const parentInput = $('.backfilledCollection:visible', this.dom);
        const pendingCheck = wait.event('check:complete', this.component);

        return Promise.resolve(
            droppableContainer.dropInBackfill(apiInput[0] || parentInput[0], source)
        )
        .then(() => wait.ms(10))
        .then(() => {
            return { check: pendingCheck };
        });
    }

    hasApiQuery() {
        return $('.apiquery--input:visible', this.dom).length > 0;
    }

    hasParentCollection() {
        return $('.backfilledCollection:visible', this.dom).length > 0;
    }

    hasParentFrontMetadata() {
        return $('.backfilledFrontMetadata:visible', this.dom).length > 0;
    }

    parentCollectionText() {
        return textInside($('.backfilledCollectionLabel', this.dom));
    }

    parentFrontMetadataText() {
        return textInside($('.backfilledFrontMetadataLabel', this.dom));
    }

    clearParentElement() {
        $('.backfilledElementClear:visible', this.dom).click();
        return wait.ms(10);
    }
}

export default function (container, parent) {
    const dom = container.querySelector('config-collection-backfill');
    return new Backfill(dom, parent);
}
