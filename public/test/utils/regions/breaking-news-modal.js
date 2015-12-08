import $ from 'jquery';
import textInside from 'test/utils/text-inside';
import 'widgets/text_alert.html!text';

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

    confirm() {
        $('.sendAlert', this.dom).click();
        return Promise.resolve(this);
    }

    cancel() {
        $('.cancelAlert', this.dom).click();
        return Promise.resolve(this);
    }
}

export default function () {
    var dom = document.querySelector('.modalDialog');
    return new Alert(dom);
}
