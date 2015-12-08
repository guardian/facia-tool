import collection from 'test/utils/regions/collection';

class Front {
    constructor(dom) {
        this.dom = dom;
    }

    collection(number) {
        return collection(number, this.dom, this);
    }

    frontSelector() {
        return this.dom.querySelector('.front-selector');
    }
}

export default function (number = 1) {
    var dom = document.querySelectorAll('.collection-container')[number - 1].parentNode;
    return new Front(dom);
}
