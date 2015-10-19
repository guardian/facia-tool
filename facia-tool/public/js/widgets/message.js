import ko from 'knockout';

class Message {
    constructor() {
        this.frontsRemainingMessage = ko.observable();
    }
}

export default new Message();
