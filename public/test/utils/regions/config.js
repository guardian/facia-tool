import $ from 'jquery';
import pinnedFront from 'test/utils/regions/pinned-front';

class FrontColumn {
    constructor(dom) {
        this.dom = dom;
    }

    addFront() {
        $('.title .linky', this.dom).click();
        return Promise.resolve(this.pinned());
    }

    pinned() {
        return pinnedFront(this.dom);
    }
}

export default function (number = 1) {
    var dom = document.querySelectorAll('.frontsConfig')[number - 1];
    return new FrontColumn(dom);
}
