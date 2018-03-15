import ko from 'knockout';

class Message {
    constructor() {
        this.textMessage = ko.observable();
        this.codeEnvMessage = ko.observable();
    }
}

export default new Message();
