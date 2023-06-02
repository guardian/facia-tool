import _ from 'underscore';
import clone from 'utils/clean-clone';
import mockjax from 'test/utils/mockjax';
import EventEmitter from 'wolfy87-eventemitter';

class Mock extends EventEmitter {

    constructor(path, urlParams = [], type = 'get') {
        super();
        let me = this;
        let lastRequest;
        this.defaultResponse = {};
        this.mockID = mockjax({
            url: path,
            type: type,
            urlParams: urlParams,
            response: function (req) {
                lastRequest = req;
                this.responseText = me.handle(req, me.defaultResponse, this);
            },
            onAfterComplete: function () {
                me.emit('complete', lastRequest);
            }
        });
    }

    dispose() {
        mockjax.clear(this.mockID);
    }

    set(response) {
        this.defaultResponse = clone(response);
    }

    update(response) {
        _.extend(this.defaultResponse, clone(response));
    }

    handle() {
        // This is the method that should be implemented by subclasses
    }
}

export default Mock;
