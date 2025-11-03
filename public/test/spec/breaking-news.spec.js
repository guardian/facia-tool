import * as mockjax from 'test/utils/mockjax';
import * as wait from 'test/utils/wait';
import Page from 'test/utils/page';
import testConfig from 'test/fixtures/breaking-news-test-config';
import 'widgets/modals/success-alert.html!text';
import 'widgets/modals/confirm-breaking-changes.html!text';
import 'widgets/modals/text-alert.html!text';

describe('Breaking News', function () {
    beforeEach(function (done) {
        this.testPage = new Page('/editorial?layout=latest,front:breaking-news', {
            testConfig,
            fixCollections: {}
        }, done);
        this.scope = mockjax.scope();
    });
    afterEach(function (done) {
        this.scope.clear();
        this.testPage.dispose(done);
    });

    it('Alerts the user before launch', function (done) {
        const regions = this.testPage.regions;
        const mockScope = this.scope;

        function failNextEditRequest() {
            mockScope({
                url: '/edits',
                method: 'post',
                response: function () {
                    done.fail();
                }
            });
        }

        expect(regions.front().frontSelector()).toBeNull();

        regions.latest().trail(1).copy()
        .then(() => {
            return this.testPage.actions.edit(() => {
                return regions.front().collection(1).group(2).pasteOver();
            })
            .assertRequest(request => {
                expect(request.url).toBe('/edits');
                expect(request.type.toLowerCase()).toBe('post');
                expect(request.data.type).toBe('Update');
                expect(request.data.update).toEqual({
                    after: false,
                    draft: true,
                    id: 'global',
                    item: 'internal-code/page/1',
                    itemMeta: {
                        group: '0'
                    },
                    live: false
                });

                failNextEditRequest();
            })
            .respondWith({
                global: {
                    draft: [{
                        id: 'internal-code/page/1',
                        meta: {
                            group: '0'
                        }
                    }]
                }
            })
            .done;
        })
        .then(() => {
            expect(regions.front().collection(1).publishText()).toBe('Send alert');
            return regions.front().collection(1).publish()
            // Wait for modal to appear
            .then(() => wait.ms(100));
        })
        .then(() => {
            expect(regions.breakingNewsModal().isVisible()).toBe(true);
            return regions.breakingNewsModal().cancel();
        })
        .then(() => {
            expect(regions.front().collection(1).group(2).trailCount()).toBe(1);
            return regions.front().collection(1).publish()
            // Wait for modal to appear
            .then(() => wait.ms(100));
        })
        .then(() => {
            expect(regions.breakingNewsModal().isVisible()).toBe(true);
            return this.testPage.actions.publish(() => {
                return regions.breakingNewsModal().confirm();
            })
            .assertRequest(request => {
                expect(request.urlParams.collection).toEqual('global');

                mockScope.clear();
            })
            .respondWith({
                global: {
                    live: [{
                        id: 'internal-code/page/1',
                        meta: { group: 0 }
                    }]
                }
            })
            .done;
        })
        .then(() => wait.ms(100))
        .then(() => {
            // confirmation alert
            expect(regions.alert().message()).toMatch(/sent successfully/i);
            return regions.alert().close();
        })
        .then(() => {
            expect(regions.front().collection(1).group(2).trailCount()).toBe(1);
            expect(regions.front().collection(1).isPublishButtonVisible()).toBe(false);

            return regions.latest().trail(2).copy();
        })
        .then(() => {
            return regions.front().collection(1).group(1).pasteOver()
            // wait for modal to appear
            .then(() => wait.ms(100));
        })
        .then(() => {
            expect(regions.front().collection(1).group(1).trailCount()).toBe(0);
            expect(regions.front().collection(1).group(2).trailCount()).toBe(1);
            expect(regions.alert().message()).toMatch(/only have one article/i);

            return regions.alert().close();
        })
        .then(() => {
            return this.testPage.actions.edit(() => {
                return regions.front().collection(1).group(2).trail(1).remove();
            })
            .assertRequest(request => {
                expect(request.data).toEqual({
                    type: 'Remove',
                    remove: {
                        item: 'internal-code/page/1',
                        id: 'global',
                        draft: true,
                        live: false
                    }
                });
            })
            .respondWith({
                global: {
                    draft: [],
                    live: [{
                        id: 'internal-code/page/1'
                    }],
                    lastUpdated: (new Date()).toISOString()
                }
            })
            .done;
        })
        .then(() => {
            expect(regions.front().collection(1).group(2).trailCount()).toBe(0);

            return this.testPage.actions.publish(() => {
                return regions.front().collection(1).publish();
            })
            .assertRequest(request => {
                expect(request.urlParams.collection).toEqual('global');
            })
            .respondWith({
                global: {
                    live: [],
                    previously: [{
                        id: 'internal-code/page/1'
                    }]
                }
            })
            .done;
        })
        .then(() => {
            expect(regions.front().collection(1).history().trailCount()).toBe(1);

            return regions.front().collection(1).history().trail(1).copy();
        })
        .then(() => {
            return this.testPage.actions.edit(() => {
                return regions.front().collection(2).group(1).pasteOver();
            })
            .assertRequest(request => {
                expect(request.url).toBe('/edits');
                expect(request.type.toLowerCase()).toBe('post');
                expect(request.data.type).toBe('Update');
                expect(request.data.update).toEqual({
                    after: false,
                    draft: true,
                    id: 'uk-alerts',
                    item: 'internal-code/page/1',
                    itemMeta: {
                        group: '1'
                    },
                    live: false
                });
            })
            .respondWith({
                'uk-alerts': {
                    draft: [{
                        id: 'internal-code/page/1',
                        meta: {
                            group: '1'
                        }
                    }],
                    live: [],
                    lastUpdated: (new Date()).toISOString()
                }
            })
            .done;
        })
        .then(() => {
            expect(regions.front().collection(1).history().trailCount()).toBe(1);
            expect(regions.front().collection(2).group(1).trailCount()).toBe(1);

            return this.testPage.actions.discard(() => {
                return regions.front().collection(2).discard();
            })
            .assertRequest(request => {
                expect(request.urlParams.collection).toEqual('uk-alerts');
            })
            .respondWith({
                'uk-alerts': {
                    live: [],
                    lastUpdated: (new Date()).toISOString()
                }
            })
            .done;
        })
        .then(() => {
            expect(regions.front().collection(1).history().trailCount()).toBe(1);
            expect(regions.front().collection(1).group(1).trailCount()).toBe(0);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('Allows the same alert to be sent multiple times', function(done) {
        const regions = this.testPage.regions;

        regions.latest().trail(1).copy()
        .then(() => {
            return this.testPage.actions.edit(() => {
                return regions.front().collection(1).group(2).pasteOver();
            })
            .respondWith({
                global: {
                    draft: [{
                        id: 'internal-code/page/1',
                        meta: {
                            group: '0'
                        }
                    }]
                }
            })
            .done;
        })
        .then(() => {
            return regions.front().collection(1).publish()
            // Wait for modal to appear
            .then(() => wait.ms(100));
        })
        .then(() => {
            return this.testPage.actions.publish(() => {
                return regions.breakingNewsModal().confirm();
            })
            .respondWith({
                global: {
                    live: [{
                        id: 'internal-code/page/1',
                        meta: { group: 0 }
                    }]
                }
            })
            .done;
        })
        .then(() => wait.ms(100))
        .then(() => {
            return regions.alert().close();
        })
        .then(() => {
            return this.testPage.actions.edit(() => {
                return regions.front().collection(1).group(2).trail(1).remove();
            })
            .respondWith({
                global: {
                    draft: [],
                    live: [{
                        id: 'internal-code/page/1'
                    }],
                    lastUpdated: (new Date()).toISOString()
                }
            })
            .done;
        })
        .then(() => {
            expect(regions.front().collection(1).publishText()).toBe('Remove');
            return regions.front().collection(1).publish();
        })
        .then(() => {
            return regions.latest().trail(0).copy();
        })
        .then(() => {
            return this.testPage.actions.edit(() => {
              return regions.front().collection(1).group(1).pasteOver();
            })
            .respondWith({
                global: {
                    draft: [{
                        id: 'internal-code/page/1',
                        meta: {
                            group: '0'
                        }
                    }]
                }
            })
            .done;
        })
        .then(() => {
            expect(regions.front().collection(1).publishText()).toBe('Send alert');
        })
        .then(() => done())
        .catch(done.fail);
    });
});
