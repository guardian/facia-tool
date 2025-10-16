import $ from 'jquery';
import Page from 'test/utils/page';

describe('Collections', function () {
    beforeEach(function (done) {
        this.testPage = new Page('/test?layout=latest,front:uk', {}, done);
    });
    afterEach(function (done) {
        this.testPage.dispose(done);
    });

    it('displays the correct timing', function () {
        expect(this.testPage.regions.front().collection(1).lastModified()).toMatch('1 day ago by Test');
    });

    it('/edits', function (done) {
        var testPage = this.testPage;

        insertInEmptyGroup()
        .then(insertAfterAnArticle)
        .then(insertOnTopOfTheList)
        .then(insertMetadataOnTopOfTheList)
        .then(moveFirstItemBelow)
        .then(moveToAnotherCollections)
        .then(removeItemFromGroup)
        .then(addSublinkInArticle)
        .then(publishLatestChanges)
        .then(() => done())
        .catch(done.fail);

        function insertInEmptyGroup () {
            return testPage.actions.edit(() => {
                return testPage.regions.latest().trail(1).dropTo(
                    testPage.regions.front().collection(2).group(1)
                );
            })
            .assertRequest(request => {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.after).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('sport');
                expect(request.data.update.item).toEqual('internal-code/page/1');
                expect(request.data.update.itemMeta.group).toEqual('3');
            })
            .respondWith({
                sport: {
                    draft: [{
                        id: 'internal-code/page/1',
                        meta: {
                            group: 3
                        }
                    }]
                }
            })
            .done;
        }

        function insertAfterAnArticle () {
            return testPage.actions.edit(() => {
                return testPage.regions.latest().trail(2).dropTo(
                    testPage.regions.front().collection(1)
                );
            })
            .assertRequest(request => {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.after).toEqual(true);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/page/2');
                expect(!!request.data.update.itemMeta).toEqual(false);
                expect(request.data.update.position).toEqual('internal-code/page/1');
            })
            .respondWith({
                latest: {
                    draft: [{
                        id: 'internal-code/page/1'
                    }, {
                        id: 'internal-code/page/2'
                    }]
                }
            })
            .done;
        }

        function insertOnTopOfTheList () {
            return testPage.actions.edit(() => {
                return testPage.regions.latest().trail(3).dropTo(
                    testPage.regions.front().collection(1).group(1).trail(1)
                );
            })
            .assertRequest(request => {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.after).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/page/3');
                expect(!!request.data.update.itemMeta).toEqual(false);
                expect(request.data.update.position).toEqual('internal-code/page/1');
            })
            .respondWith({
                latest: {
                    draft: [{
                        id: 'internal-code/page/3'
                    }, {
                        id: 'internal-code/page/1'
                    }, {
                        id: 'internal-code/page/2'
                    }]
                }
            })
            .done;
        }

        function insertMetadataOnTopOfTheList () {
            return testPage.actions.edit(() => {
                return testPage.regions.front().collection(1).group(1).trail(1).open()
                .then(trail => trail.toggleMetadata('isBreaking'))
                .then(trail => trail.save());
            })
            .assertRequest(request => {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect('after' in request.data.update).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/page/3');
                expect(request.data.update.itemMeta.isBreaking).toEqual(true);
                expect(request.data.update.position).toEqual('internal-code/page/3');
            })
            .respondWith({
                latest: {
                    draft: [{
                        id: 'internal-code/page/3',
                        meta: {
                            isBreaking: true
                        }
                    }, {
                        id: 'internal-code/page/1'
                    }, {
                        id: 'internal-code/page/2'
                    }]
                }
            })
            .done;
        }

        function moveFirstItemBelow () {
            return testPage.actions.edit(() => {
                var firstCollection = testPage.regions.front().collection(1);
                return firstCollection.group(1).trail(1).dropTo(
                    firstCollection.group(1).trail(3)
                );
            })
            .assertRequest(request => {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.after).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/page/3');
                expect(request.data.update.itemMeta.isBreaking).toEqual(true);
                expect(request.data.update.position).toEqual('internal-code/page/2');
            })
            .respondWith({
                latest: {
                    draft: [{
                        id: 'internal-code/page/1'
                    }, {
                        id: 'internal-code/page/3',
                        meta: {
                            isBreaking: true
                        }
                    }, {
                        id: 'internal-code/page/2'
                    }]
                }
            })
            .done;
        }

        function moveToAnotherCollections () {
            return testPage.actions.edit(() => {
                var firstCollection = testPage.regions.front().collection(1);
                var secondCollection = testPage.regions.front().collection(2);
                return firstCollection.group(1).trail(2).dropTo(
                    secondCollection.group(1).trail(1)
                );
            })
            .assertRequest(request => {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('UpdateAndRemove');
                expect(request.data.update.after).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('sport');
                expect(request.data.update.item).toEqual('internal-code/page/3');
                expect(request.data.update.itemMeta.isBreaking).toEqual(true);
                expect(request.data.update.itemMeta.group).toEqual('3');
                expect(request.data.update.position).toEqual('internal-code/page/1');
                expect(request.data.remove.draft).toEqual(true);
                expect(request.data.remove.live).toEqual(false);
                expect(request.data.remove.id).toEqual('latest');
                expect(request.data.remove.item).toEqual('internal-code/page/3');
            })
            .respondWith({
                latest: {
                    draft: [{
                        id: 'internal-code/page/1'
                    }, {
                        id: 'internal-code/page/2'
                    }]
                },
                sport: {
                    draft: [{
                        id: 'internal-code/page/3',
                        meta: {
                            isBreaking: true,
                            group: 3
                        }
                    }, {
                        id: 'internal-code/page/1',
                        meta: {
                            group: 3
                        }
                    }]
                }
            })
            .done;
        }

        function removeItemFromGroup () {
            return testPage.actions.edit(() => {
                return testPage.regions.front().collection(2).group(1).trail(2).remove();
            })
            .assertRequest(request => {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Remove');
                expect(request.data.remove.draft).toEqual(true);
                expect(request.data.remove.live).toEqual(false);
                expect(request.data.remove.id).toEqual('sport');
                expect(request.data.remove.item).toEqual('internal-code/page/1');
            })
            .respondWith({
                sport: {
                    draft: [{
                        id: 'internal-code/page/3',
                        meta: {
                            isBreaking: true,
                            group: 3
                        }
                    }]
                }
            })
            .done;
        }

        function addSublinkInArticle () {
            return testPage.actions.edit(() => {
                return testPage.regions.front().collection(1).group(1).trail(2).open()
                .then(trail => {
                    return testPage.regions.latest().trail(5).dropTo(trail.innerDroppable())
                        .then(() => trail.save());
                });
            })
            .assertRequest(request => {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/page/2');
                expect(request.data.update.itemMeta.supporting[0].id).toEqual('internal-code/page/5');
            })
            .respondWith({
                latest: {
                    draft: [{
                        id: 'internal-code/page/1'
                    }, {
                        id: 'internal-code/page/2',
                        meta: {
                            supporting: [{
                                id: 'internal-code/page/5'
                            }]
                        }
                    }]
                }
            })
            .done;
        }

        function publishLatestChanges () {
            return testPage.actions.publish(() => {
                return testPage.regions.front().collection(1).publish();
            })
            .assertRequest(request => {
                expect(request.urlParams.collection).toEqual('latest');
            })
            .respondWith({
                latest: {
                    live: [{
                        id: 'internal-code/page/1'
                    }, {
                        id: 'internal-code/page/2',
                        meta: {
                            supporting: [{
                                id: 'internal-code/page/5'
                            }]
                        }
                    }]
                }
            })
            .done;
        }
    });

    it('copy to clipboard', function (done) {
        this.testPage.regions.latest().trail(5).copyToClipboard()
        .then(() => {
            expect(this.testPage.regions.clipboard().trail(1).fieldText('headline')).toBe('Nothing happened for once');
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('closes without saving', function (done) {
        this.testPage.regions.front().collection(1).group(1).trail(1).open()
        .then(trail => trail.type('headline', 'different'))
        .then(trail => trail.close())
        .then(() => {
            const trail = this.testPage.regions.front().collection(1).group(1).trail(1);
            expect(trail.fieldText('headline')).toBe('I won the elections');
            expect($('.editor', trail.dom).is(':visible')).toBe(false);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('copy paste above an article', function (done) {
        this.testPage.actions.edit(() => {
            const regions = this.testPage.regions;
            return regions.latest().trail(5).copy()
            .then(() => regions.front().collection(1).group(1).trail(1).paste());
        })
        .assertRequest(request => {
            expect(request.url).toBe('/edits');
            expect(request.data.type).toBe('Update');
            expect(request.data.update).toEqual({
                after: false,
                live: false,
                draft: true,
                id: 'latest',
                item: 'internal-code/page/5',
                position: 'internal-code/page/1'
            });
        })
        .respondWith({
            latest: {
                draft: [{
                    id: 'internal-code/page/5',
                    meta: {
                        group: 0
                    }
                }, {
                    id: 'internal-code/page/1',
                    meta: {
                        group: 0
                    }
                }]
            }
        })
        .done
        .then(() => done())
        .catch(done.fail);
    });
});
