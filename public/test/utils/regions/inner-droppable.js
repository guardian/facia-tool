class InnerDroppable {
    constructor(dom, parent) {
        this.dom = dom;
        this.parent = parent;
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
}

export default function (container, parent) {
    var dom = container.querySelector('.supporting .droppable');
    return new InnerDroppable(dom, parent);
}
