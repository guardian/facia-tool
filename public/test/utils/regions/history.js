import {default as trail, count as trailCount} from 'test/utils/regions/trail';

class History {
    constructor(dom, parent) {
        this.dom = dom;
        this.parent = parent;
    }

    trail(number) {
        return trail(number, this.dom, this);
    }

    trailCount() {
        return trailCount(this.dom);
    }

    isEmpty() {
        return trailCount(this.dom) === 0;
    }
}

export default function (container, parent) {
    var dom = container.querySelector('.history');
    return new History(dom, parent);
}
