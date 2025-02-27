import _ from 'underscore';
import ko from 'knockout';
import $ from 'jquery';
import persistence from 'models/config/persistence';
import * as capi from 'modules/content-api';
import * as vars from 'modules/vars';
import * as dom from 'test/utils/dom-nodes';
import {injectColumnWidget} from 'test/utils/inject';
import images from 'test/utils/images';
import configRegion from 'test/utils/regions/config';
import * as wait from 'test/utils/wait';
import * as mockjax from 'test/utils/mockjax';
import observableNumeric from '../../src/js/utils/observable-numeric';

describe('Config Front', function () {
    beforeEach(function () {
        this.ko = injectColumnWidget('fronts-config-widget');
        this.loadFront = (model = {}) => {
            return this.ko.apply(_.defaults(model, {
                state: ko.observable({
                    config: {
                        fronts: {
                            existing: {}
                        }
                    },
                    defaults: {
                        editions: []
                    }
                }),
                types: ko.observableArray(['type-one', 'type-two']),
                typesGroups: {
                    'type-one': ['group-a', 'group-b']
                },
                typesGroupsConfig: {
                    'type-one': ko.observableArray(
                      [
                        {name: 'group-a', maxItems: observableNumeric(10)},
                        {name: 'group-b', maxItems: observableNumeric(10)}
                      ]
                    )
                }
            }), true);
        };
        images.setup();
        this.originalsearchDebounceMs = vars.CONST.searchDebounceMs;
        vars.CONST.searchDebounceMs = 50;
        spyOn(persistence.front, 'update');
        spyOn(persistence.collection, 'save');
        spyOn(capi, 'fetchContent').and.callFake(query => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (query.indexOf('zero') === 0) {
                        resolve({ content: [] });
                    } else if (query.indexOf('news') === 0){
                        resolve({
                            content: [
                                { id: 'one', fields: { headline: 'First result' } },
                                { id: 'two', fields: { headline: 'Second result' } }
                            ]
                        });
                    } else {
                        reject(new Error('No results'));
                    }
                }, 50);
            });
        });
        spyOn(capi, 'fetchMetaForPath').and.callFake(() => {
            return new Promise(resolve => {
                resolve({
                    webTitle: 'Old title'
                });
            });
        });
        this.scope = mockjax.scope();
        this.scope({
            url: '/api/usage/add',
            responseText: {},
            method: 'post'
        });
    });
    afterEach(function () {
        vars.CONST.searchDebounceMs = this.originalsearchDebounceMs;
        images.dispose();
        this.ko.dispose();
        this.scope.clear();
    });

    it('create fronts and collections', function (done) {
        var frontWidget, region;

        this.loadFront()
        .then(widget => {
            frontWidget = widget;
            region = configRegion();
        })
        .then(createFrontAndCollection)
        .then(createCollectionWithCAPI)
        .then(modifyCollectionWithInvalidCAPI)
        .then(removeCollection)
        .then(editMetadata)
        .then(changeImageUrl)
        .then(deleteLastRemainingCollection)
        .then(() => done())
        .catch(done.fail);

        function createFrontAndCollection () {
            return region.addFront()
            // some form of validation
            .then(pinned => pinned.type('id', '/something////here/'))
            .then(pinned => pinned.create())
            .then(pinned => {
                expect(pinned.title()).toBe('something/here');

                return pinned.createCollection();
            })
            .then(collection => {
                return Promise.all([
                    collection.toggle('showDateHeader'),
                    collection.type('title', 'new collection'),
                    collection.chooseLayout(1)
                ])
                .then(() => collection.save());
            })
            .then(() => {
                // Until persisted the front is still pinned
                expect(frontWidget.fronts().length).toBe(0);
                expect(!!frontWidget.pinnedFront()).toBe(true);
                var front = frontWidget.pinnedFront();
                var collection = front.collections.items()[0];
                expect(front.props.isHidden()).toBe(true);
                expect(persistence.collection.save).toHaveBeenCalledWith(collection);
                expect(collection.meta.showDateHeader()).toBe(true);
                expect(collection.meta.type()).toBe('type-two');
                expect(collection.meta.displayName()).toBe('new collection');
                persistence.collection.save.calls.reset();
            });
        }

        function createCollectionWithCAPI () {
            return region.pinned().createCollection()
            .then(collection => {
                return Promise.all([
                    collection.type('title', 'collection with capi'),
                    collection.chooseLayout(0),
                    collection.backfill().type('ne  ws').then(waiting => waiting.check)
                ])
                .then(() => collection);
            })
            .then(collection => {
                expect(collection.backfill().text()).toBe('news');
                expect(collection.backfill().results().length).toBe(2);

                return collection.save();
            })
            .then(() => {
                var front = frontWidget.pinnedFront();
                var collection = front.collections.items()[1];
                expect(persistence.collection.save).toHaveBeenCalledWith(collection);
                expect(collection.meta.type()).toBe('type-one');
                expect(collection.meta.displayName()).toBe('collection with capi');
                expect(collection.meta.backfill()).toEqual({
                    type: 'capi',
                    query: 'news'
                });
                persistence.collection.save.calls.reset();
            });
        }

        function modifyCollectionWithInvalidCAPI () {
            return region.pinned().collection(2).open()
            .then(collection => {
                return Promise.all([
                    collection.toggle('showTags'),
                    collection.backfill().type('zero').then(waiting => waiting.check)
                ])
                .then(() => collection);
            })
            .then(collection => {
                expect(collection.backfill().text()).toBe('zero');
                expect(collection.backfill().results().length).toBe(0);
                expect(collection.backfill().status()).toBe('No matches found');

                return collection.backfill().type('fail')
                    .then(waiting => waiting.check)
                    .then(() => collection);
            })
            .then(collection => {
                expect(collection.backfill().text()).toBe('fail');
                expect(collection.backfill().results().length).toBe(0);
                expect(collection.backfill().status()).toBe('No matches found');

                return collection.save();
            })
            .then(() => {
                var front = frontWidget.pinnedFront();
                var collection = front.collections.items()[1];
                expect(persistence.collection.save).toHaveBeenCalledWith(collection);
                expect(collection.meta.type()).toBe('type-one');
                expect(collection.meta.displayName()).toBe('collection with capi');
                expect(collection.meta.backfill()).toEqual({
                    type: 'capi',
                    query: 'fail'
                });
                expect(collection.meta.showTags()).toBe(true);
                persistence.collection.save.calls.reset();
            });
        }

        function removeCollection () {
            return region.pinned().collection(2).open()
            .then(collection => collection.remove())
            .then(() => {
                var front = frontWidget.pinnedFront();
                expect(persistence.front.update).toHaveBeenCalledWith(front);
                expect(front.collections.items().length).toBe(1);
                expect(front.collections.items()[0].meta.displayName()).toBe('new collection');
                persistence.front.update.calls.reset();
            });
        }

        function editMetadata () {
            $('.linky.tool--metadata').click();
            dom.type('.metadata--title', 'Nicer title');
            $('.toggle--hidden').click();
            $('.save-metadata').click();

            return wait.ms(100).then(() => {
                var front = frontWidget.pinnedFront();
                expect(persistence.front.update).toHaveBeenCalledWith(front);
                expect(front.props.webTitle()).toBe('Nicer title');
                expect(front.props.isHidden()).toBe(false);
                persistence.front.update.calls.reset();
            });
        }

        function changeImageUrl () {
            $('.linky.tool--metadata').click();
            var imageUrl = images.path('square.png');
            dom.type('.metadata--provisionalImage', imageUrl);

            return wait.ms(500).then(() => {
                var front = frontWidget.pinnedFront();
                expect(persistence.front.update).toHaveBeenCalledWith(front);
                expect(front.props.webTitle()).toBe('Nicer title');
                expect(front.props.imageUrl()).toBe(imageUrl);
                expect(front.props.imageWidth()).toBe(140);
                expect(front.props.imageHeight()).toBe(140);
                expect(front.props.isHidden()).toBe(false);
                persistence.front.update.calls.reset();
            });
        }

        function deleteLastRemainingCollection () {
            $('.cnf-collection:nth(0) .cnf-collection__name').click();
            $('.tool--rhs').click();

            var front = frontWidget.pinnedFront();
            expect(persistence.front.update).toHaveBeenCalledWith(front);
            expect(front.collections.items().length).toBe(0);
            persistence.front.update.calls.reset();
        }
    });

    it('updates fronts and collections when config changes', function (done) {
        var state = ko.observable({
            config: {
                fronts: { one: { collections: ['apple'] } },
                collections: {
                    apple: { displayName: 'apple' },
                    pear: { displayName: 'pear' },
                    kiwi: { displayName: 'kiwi' }
                }
            },
            defaults: {}
        }), frontsList = ko.observableArray([{ id: 'one', collections: ['apple'] }]);

        this.loadFront({state, frontsList})
        .then(() => {
            expect($('.cnf-front').length).toBe(1);

            // update creates a new front
            var otherState = state();
            otherState.config.fronts = {
                one: { collections: ['apple'] },
                two: { collections: ['pear'] }
            };
            frontsList([{ id: 'one', collections: ['apple'] }, { id: 'two' }]);
            state(otherState);
            return wait.ms(20);
        })
        .then(() => {
            expect($('.cnf-front').length).toBe(2);

            // open one of the fronts
            $('.cnf-front:nth(0) .title--text').click();
        })
        .then(() => {
            expect($('.cnf-front:nth(0) .cnf-collection').length).toBe(1);

            var otherState = state();
            otherState.config.fronts = {
                one: { collections: ['apple', 'kiwi'] },
                two: { collections: ['pear'] }
            };
            frontsList([{ id: 'one', collections: ['apple', 'kiwi'] }, { id: 'two' }]);
            state(otherState);
            return wait.ms(20);
        })
        .then(() => {
            expect($('.cnf-front').length).toBe(2);
            expect($('.cnf-front:nth(0) .cnf-collection').length).toBe(2);

            // opened front gets removed
            var otherState = state();
            otherState.config.fronts = {
                two: { collections: ['pear'] }
            };
            frontsList([{ id: 'two' }]);
            state(otherState);
        })
        .then(() => {
            expect($('.cnf-front').length).toBe(1);
            expect($('.cnf-front .title--text').text()).toBe('two');
        })
        .then(() => done())
        .catch(done.fail);
    });
});
