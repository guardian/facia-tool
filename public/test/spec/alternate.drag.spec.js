import Page from 'test/utils/page';
import * as mockjax from 'test/utils/mockjax';
import * as wait from 'test/utils/wait';
import 'widgets/trail-editor.html!text';

describe('Alternate Drag', function () {
    beforeEach(function (done) {
        this.scope = mockjax.scope();
        this.testPage = new Page('/test?layout=latest,front:uk', {}, done);
    });
    afterEach(function (done) {
        this.testPage.dispose(done);
    });

    it('replace article and drags sublinks', function (done) {
        var mockScope = this.scope, testPage = this.testPage;
        openFirstArticle()
        .then(trail => trail.toggleMetadata('isBreaking'))
        .then(trail => trail.toggleMetadata('showLargeHeadline'))
        .then(dropSublink)
        .then(copyPasteSublink)
        .then(saveArticle)
        .then(openFirstArticle)
        .then(alternateDrag)
        .then(expectItemSwapped)
        .then(openFirstArticle)
        .then(deleteOneSublink)
        .then(saveArticleWithOneSublink)
        .then(deleteEntireArticle)
        .then(() => done())
        .catch(done.fail);


        function openFirstArticle () {
            return testPage.regions.front().collection(1).group(1).trail(1).open();
        }
        function dropSublink (trail) {
            return testPage.regions.latest().trail(2).dropTo(trail.innerDroppable())
            .then(() => trail);
        }
        function copyPasteSublink (trail) {
            return testPage.regions.latest().trail(3).copy().then(() => {
                return trail.pasteOver();
            });
        }
        function saveArticle (trail) {
            return testPage.actions.edit(() => {
                return trail.save();
            })
            .assertRequest(request => {
                expect(request.url).toBe('/edits');
                expect(request.data).toEqual({
                    type: 'Update',
                    update: {
                        live: false,
                        draft: true,
                        id: 'latest',
                        item: 'internal-code/page/1',
                        position: 'internal-code/page/1',
                        itemMeta: {
                            group: '0',
                            isBreaking: true,
                            showLargeHeadline: true,
                            supporting: [
                                { id: 'internal-code/page/2' },
                                { id: 'internal-code/page/3' }
                            ]
                        }
                    }
                });
            })
            .respondWith({
                latest: {
                    draft: [{
                        id: 'internal-code/page/1',
                        meta: {
                            isBreaking: true,
                            showLargeHeadline: true,
                            supporting: [
                                { id: 'internal-code/page/2' },
                                { id: 'internal-code/page/3' }
                            ]
                        }
                    }]
                }
            })
            .done;
        }
        function alternateDrag (trail) {
            // This action is making to consecutive requests
            var requestIndex = 0, requests = [], responses = [{
                latest: {
                    lastUpdated: (new Date()).toISOString(),
                    draft: [{
                        id: 'internal-code/page/4',
                            meta: {
                                isBreaking: true,
                                showLargeHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' },
                                    { id: 'internal-code/page/3' }
                                ]
                            }
                    }, {
                        id: 'internal-code/page/1',
                            meta: {
                                isBreaking: true,
                                showLargeHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' },
                                    { id: 'internal-code/page/3' }
                                ]
                            }
                    }]
                }
            }, {
                latest: {
                    lastUpdated: (new Date()).toISOString() + 10,
                    draft: [{
                        id: 'internal-code/page/4',
                            meta: {
                                isBreaking: true,
                                showLargeHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' },
                                    { id: 'internal-code/page/3' }
                                ]
                            }
                    }]
                }
            }];
            mockScope({
                url: '/edits',
                method: 'post',
                response: function (req) {
                    requests.push(JSON.parse(req.data));
                    this.responseText = responses[requestIndex];
                    testPage.mocks.mockCollections.set(this.responseText);
                    requestIndex += 1;
                }
            });

            return new Promise(resolve => {
                testPage.regions.latest().trail(4).dropTo(
                    trail.innerDroppable(),
                    true
                )
                .then(() => wait.ms(10))
                .then(() => {
                    expect(requests.length).toBe(2);
                    expect(requests[0]).toEqual({
                        type: 'Update',
                        update: {
                            live: false,
                            draft: true,
                            id: 'latest',
                            item: 'internal-code/page/4',
                            position: 'internal-code/page/1',
                            after: false,
                            itemMeta: {
                                isBreaking: true,
                                showLargeHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' },
                                    { id: 'internal-code/page/3' }
                                ]
                            }
                        }
                    });
                    expect(requests[1]).toEqual({
                        type: 'Remove',
                        remove: {
                            live: false,
                            draft: true,
                            id: 'latest',
                            item: 'internal-code/page/1'
                        }
                    });

                    resolve();
                });
            });
        }
        function expectItemSwapped () {
            mockScope.clear();
            const trail = testPage.regions.front().collection(1).group(1).trail(1);
            expect(trail.fieldText('headline')).toBe('Santa Claus is a real thing');
        }
        function deleteOneSublink (trail) {
            // Sublink need populating from CAPI
            return wait.ms(50).then(() => {
                return testPage.actions.edit(() => trail.sublink(2).remove())
                .assertRequest(request => {
                    expect(request.data).toEqual({
                        type: 'Update',
                        update: {
                            live: false,
                            draft: true,
                            id: 'latest',
                            item: 'internal-code/page/4',
                            position: 'internal-code/page/4',
                            itemMeta: {
                                isBreaking: true,
                                showLargeHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' }
                                ],
                                group: '0'
                            }
                        }
                    });
                })
                .respondWith({
                    latest: {
                        draft: [{
                            id: 'internal-code/page/4',
                            meta: {
                                isBreaking: true,
                                showLargeHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' }
                                ]
                            }
                        }]
                    }
                })
                .done;
            });
        }
        function saveArticleWithOneSublink () {
            const trail = testPage.regions.front().collection(1).group(1).trail(1);
            return testPage.actions.edit(() => trail.save())
            .assertRequest(request => {
                expect(request.url).toBe('/edits');
                expect(request.data).toEqual({
                    type: 'Update',
                    update: {
                        live: false,
                        draft: true,
                        id: 'latest',
                        item: 'internal-code/page/4',
                        position: 'internal-code/page/4',
                        itemMeta: {
                            group: '0',
                            isBreaking: true,
                            showLargeHeadline: true,
                            supporting: [
                                { id: 'internal-code/page/2' }
                            ]
                        }
                    }
                });
            })
            .respondWith({
                latest: {
                    draft: [{
                        id: 'internal-code/page/4',
                        meta: {
                            isBreaking: true,
                            showLargeHeadline: true,
                            supporting: [
                                { id: 'internal-code/page/2' }
                            ]
                        }
                    }]
                }
            })
            .done;
        }
        function deleteEntireArticle () {
            const trail = testPage.regions.front().collection(1).group(1).trail(1);
            return testPage.actions.edit(() => trail.remove())
            .assertRequest(request => {
                expect(request.url).toBe('/edits');
                expect(request.data).toEqual({
                    type: 'Remove',
                    remove: {
                        live: false,
                        draft: true,
                        id: 'latest',
                        item: 'internal-code/page/4'
                    }
                });
                expect(testPage.regions.front().collection(1).group(1).isEmpty()).toBe(true);
            })
            .respondWith({
                latest: { live: [] }
            })
            .done;
        }
    });
});
