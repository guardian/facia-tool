import trail from 'test/utils/regions/trail';

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

    isEmpty() {
        return trail(1, this.dom, this).dom == null;
    }
}

export default function (number = 1, container, parent) {
    var dom = container.querySelectorAll('.droppable')[number - 1];
    return new Group(dom, parent);
}
