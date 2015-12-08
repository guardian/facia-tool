import trail from 'test/utils/regions/trail';

export class Clipboard {
    constructor(dom) {
        this.dom = dom;
    }

    trail(number) {
        return trail(number, this.dom, this);
    }
}

export default function (number = 1) {
    var dom = document.querySelectorAll('clipboard-widget')[number - 1].parentNode;
    return new Clipboard(dom);
}
