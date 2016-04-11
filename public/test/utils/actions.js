import editAction from 'test/utils/actions/edit-actions';
import publishAction from 'test/utils/actions/publish-actions';
import discardAction from 'test/utils/actions/discard-actions';

class Action {
    constructor(Handler, testAction, page) {
        this.testAction = testAction;
        this.page = page;
        this.handler = new Handler(testAction, page);
    }

    assertRequest(assertFunction) {
        this.assertFunction = assertFunction;
        schedule(this);
        return this;
    }

    respondWith(serverResponse) {
        this.handler.setResponse(serverResponse);
        schedule(this);
        return this;
    }

    dispose() {
        this.handler.dispose();
    }
}

export default function install (page) {
    return {
        edit: function (testAction) {
            return new Action(editAction, testAction, page);
        },
        publish: function (testAction) {
            return new Action(publishAction, testAction, page);
        },
        discard: function (testAction) {
            return new Action(discardAction, testAction, page);
        }
    };
}

var scheduledMap = new Map();

function schedule (action) {
    if (!scheduledMap.has(action)) {
        const forLater = Promise.resolve(action).then(execute);
        scheduledMap.set(action, forLater);
        const clear = clearAction(action);
        forLater.then(clear, clear);
        action.done = forLater;
    }
}

function execute (action) {
    return Promise.resolve(action.handler.execute()).then(request => {
        if (action.assertFunction) {
            return action.assertFunction(request);
        }
    });
}

function clearAction (action) {
    return function () {
        action.dispose();
        scheduledMap.delete(action);
    };
}
