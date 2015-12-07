import BaseAction from 'test/utils/base-action';

export default class extends BaseAction {
    constructor(...args) {
        super(...args);
        this.TIMEOUT_ERROR_MSG = 'publish action timeout';

        super.mockSingleRequest({
            url: /collection\/publish\/(.+)/,
            urlParams: ['collection'],
            type: 'post',
            responseText: ''
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
