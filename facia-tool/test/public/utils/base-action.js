import mockjax from 'test/utils/mockjax';

export default class {
    constructor(testAction, page) {
        this.testAction = testAction;
        this.testPage = page;

        this.waitForRequest = new Promise((resolve, reject) => {
            this.firstRequestResolve = resolve;
            this.firstRequestReject = reject;
        });

        this.timeoutID = setTimeout(() => {
            this.firstRequestReject(new Error(this.TIMEOUT_ERROR_MSG || 'action timeout'));
        }, 2000);
    }

    mockSingleRequest(mock) {
        const instance = this;
        this.interceptor = mockjax(Object.assign({
            response: function (request) {
                instance.lastRequest = request;
                this.responseText = mock.responseText;
            },
            onAfterComplete: function () {
                setTimeout(() => {
                    instance.firstRequestResolve(instance.lastRequest);
                }, 20);
            }
        }, mock));
    }

    setResponse(response) {
        this.response = response;
    }

    execute() {
        return Promise.resolve(this.testAction)
            .then(fn => fn())
            .then(() => this.waitForRequest);
    }

    dispose() {
        mockjax.clear(this.interceptor);
    }
}
