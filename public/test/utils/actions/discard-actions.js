import BaseAction from 'test/utils/actions/base-action';
import * as wait from 'test/utils/wait';

export default class extends BaseAction {
    constructor(...args) {
        super(...args);
        this.TIMEOUT_ERROR_MSG = 'discard action timeout';

        const instance = this;
        super.mockSingleRequest({
            url: /collection\/discard\/(.+)/,
            urlParams: ['collection'],
            type: 'post',
            responseText: '',
            onAfterComplete: function () {
                // Wait for the next collection populate
                wait.event('complete', instance.testPage.mocks.mockCollections)
                .then(() => wait.ms(20))
                .then(() => instance.firstRequestResolve(instance.lastRequest));
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
