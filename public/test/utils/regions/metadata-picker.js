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

    options() {
        const list = [];
        $('.frontTagsPicker option', this.dom).each((i, dom) => {
            list.push(textInside(dom));
        });
        return list;
    }

    setOption(value) {
        $('.frontTagsPicker', this.dom).val(value).change();
        return Promise.resolve();
    }

    cancel() {
        $('.button-cancel', this.dom).click();
        return wait.ms(100).then(() => this);
    }

    select() {
        $('.button-action', this.dom).click();
        return wait.ms(100).then(() => this);
    }
}

export default function () {
    var dom = document.querySelector('.modalDialog');
    return new Alert(dom);
}
