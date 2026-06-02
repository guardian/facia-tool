import $ from 'jquery';
import textInside from 'test/utils/text-inside';
import 'widgets/modals/text-alert.html!text';
import * as wait from 'test/utils/wait';

export class Alert {
    constructor(dom) {
        this.dom = dom;
    }

    isVisible() {
        return $('.modalDialog-message', this.dom).is(':visible');
    }

    message() {
        return textInside($('.modalDialog-message', this.dom));
    }

    close() {
        $('.button-action', this.dom).click();
        return wait.condition(() => !this.isVisible(), 2000, 10, 'alert closed').then(() => this);
    }
}

export default function () {
    var dom = document.querySelector('.modalDialog');
    return new Alert(dom);
}
