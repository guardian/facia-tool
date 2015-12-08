import {default as trail, count as trailCount} from 'test/utils/regions/trail';
import $ from 'jquery';

class Group {
    constructor(dom, parent) {
        this.dom = dom;
        this.parent = parent;
    }

    trail(number) {
        return trail(number, this.dom, this);
    }

    dragContainer() {
        return this.dom;
    }

    dropContainer() {
        return this.dom;
    }

    dropTarget() {
        return this.dom;
    }

    trailCount() {
        return trailCount(this.dom);
    }

    isEmpty() {
        return trailCount(this.dom) === 0;
    }

    pasteOver() {
        $('.pasteOver', this.dom).click();
        return Promise.resolve(this);
    }
}

export default function (number = 1, container, parent) {
    var dom = container.querySelectorAll('.droppable')[number - 1];
    return new Group(dom, parent);
}
