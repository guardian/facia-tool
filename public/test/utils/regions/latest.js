import trail from 'test/utils/regions/trail';

export class Latest {
    constructor(dom) {
        this.dom = dom;
    }

    trail(number) {
        return trail(number, this.dom, this);
    }

    dragContainer() {
        return null;
    }
}

export default function (number = 1) {
    var dom = document.querySelectorAll('.latest-articles')[number - 1].parentNode;
    return new Latest(dom);
}
