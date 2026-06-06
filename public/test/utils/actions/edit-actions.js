import BaseAction from 'test/utils/actions/base-action';

export default class extends BaseAction {
    constructor(...args) {
        super(...args);
        this.TIMEOUT_ERROR_MSG = 'edit action timeout, endpoint /edits';

        var instance = this;

        super.mockSingleRequest({
            url: '/edits',
            response: function (request) {
                request.data = JSON.parse(request.data);
                instance.lastRequest = request;
                this.responseText = instance.response;
            }
        });
    }

    setResponse(response) {
        for (var name in response) {
            response[name].lastUpdated = (new Date()).toISOString();
        }
        super.setResponse(response);
        this.testPage.mocks.mockCollections.set(response);
    }
}
