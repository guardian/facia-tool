import _ from 'underscore';
import fetch from 'utils/fetch-visible-stories';
import Mock from 'mock/stories-visible';
import * as wait from 'test/utils/wait';

describe('Fetch visible stories', function () {
    function createGroups() {
        return _.map(arguments, function (group, index) {
            return {
                items: function () {
                    return _.map(group, function (item) {
                        return {
                            group: {
                                index: index
                            },
                            meta: {
                                isBoosted: function () {
                                    return item;
                                }
                            }
                        };
                    });
                }
            };
        });
    }

    beforeEach(function () {
        this.mock = new Mock();
    });
    afterEach(function () {
        this.mock.dispose();
    });

    it('fails when there are no stories', function (done) {
        fetch('anything', createGroups())
        .then(done.fail, function (err) {
            expect(err.message).toMatch(/Empty collection/i);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('fails if the network fails', function (done) {
        fetch('fail', createGroups([false]))
        .then(done.fail)
        .catch(function (err) {
            expect(err).toMatch(/fail/i);
        })
        .then(() => done());
    });

    it('gets the visible stories', function () {
        this.mock.set({
            'collection': {
                mobile: 1
            }
        });

        return fetch('collection', createGroups([false], [false, true]))
        .then(response => {
            expect(response).toEqual({
                mobile: 1
            });
        })
        .then(() => wait.event('visible:stories:fetch'))
        .then(event => {
            expect(event).toEqual({
                mobile: 1
            });
        });
    });
});
