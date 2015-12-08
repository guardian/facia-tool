import ko from 'knockout';

class Message {
    constructor() {
        this.textMessage = ko.observable();
    }
}

export default new Message();
