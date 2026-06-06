import {default as trail, count as trailCount} from 'test/utils/regions/trail';
import $ from 'jquery';
import ko from 'knockout';
import copiedArticle from 'modules/copied-article';
import * as wait from 'test/utils/wait';

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
        return wait.condition(() => $('.pasteOver', this.dom).length > 0).then(() => {
            var targets = $('.pasteOver', this.dom);
            targets.click();
            return this;
        });
    }
}

export default function (number = 1, container, parent) {
    var dom = container.querySelectorAll('.droppable')[number - 1];
    return new Group(dom, parent);
}
