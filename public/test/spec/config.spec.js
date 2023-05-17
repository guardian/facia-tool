import $ from 'jquery';
import drag from 'test/utils/drag';
import configAction from 'test/utils/config-actions';
import * as dom from 'test/utils/dom-nodes';
import ConfigLoader from 'test/utils/config-loader';
import textInside from 'test/utils/text-inside';
import * as wait from 'test/utils/wait';
import * as mockjax from 'test/utils/mockjax';

describe('Config', function () {

    beforeEach(function () {
        this.scope = mockjax.scope();
        this.scope({
            url: '/metadata',
            status: 200,
            responseText: [
                {
                    'type': 'tag'
                },
                {
                    'type': 'secondTag'
                }

            ]
        });
    });
    afterEach(function () {
        this.testInstance.dispose();
        this.scope.clear();
    });


    it('/config/fronts', function (done) {

        this.testInstance = new ConfigLoader();
        var mockConfig = this.testInstance.mockConfig,
            baseModel;

        this.testInstance.load()
        .then(model => {
            baseModel = model;

            return createFrontWithCollection();
        })
        .then(function (request) {
            var data = request.data;
            expect(data.id).toEqual('test/front');
            expect(data.initialCollection.displayName).toEqual('gossip');
            expect(data.initialCollection.type).toEqual('fixed/small/slow-IV');
            expect(data.priority).toEqual('test');

            $('.contentPane:nth(1) .title--text:nth(1)').click();
            return dragAnotherCollectionInsideFirstColumn(mockConfig, baseModel, $('.contentPane:nth(1) .cnf-collection')[1], {
                fronts: {
                    'test/front': {
                        collections: ['sport', 'gossip'],
                        priority: 'test'
                    }
                }
            });
        })
        .then(function (request) {
            expect(request.front).toEqual('test/front');
            var data = request.data;
            expect(data.id).toEqual('test/front');
            expect(data.priority).toEqual('test');
            expect(data.collections).toEqual(['sport', 'gossip']);

            expect(textInside('.contentPane:nth(0) .cnf-collection:nth(0)')).toBe('1 Sport also on uk');
            expect(textInside('.contentPane:nth(1) .cnf-collection:nth(1)')).toBe('2 Sport also on test/front');

            return dragInsideTheSameCollection();
        })
        .then(function (request) {
            expect(request.front).toEqual('test/front');
            var data = request.data;
            expect(data.id).toEqual('test/front');
            expect(data.priority).toEqual('test');
            expect(data.collections).toEqual(['gossip', 'sport']);
        })
        .then(function () {
            var front = dom.$('.cnf-front.open');

            dom.click(front.querySelector('.tool--container'));
            dom.type(front.querySelector('.cnf-form input[type=text]'), 'with-tags');
            dom.click(front.querySelector('.cnf-form .type-option-chosen'));
            dom.click(front.querySelector('.cnf-form .type-picker .type-option'));
            return addTag(1)
            .then(() => {
                expect(textInside('.fstResultItem:first-child')).toBe('tag');
                expect(textInside('.fstResultItem:nth-child(2)')).toBe('secondTag');
                expect(textInside('.fstChoiceItem').slice(0, -1)).toBe('tag');
                return saveCollection({
                    fronts: {
                        'test/front': {
                            collections: ['gossip', 'Sport', 'with-tags'],
                            priority: 'test'
                        }
                    },
                    collections: {
                        'with-tags': {
                            type: 'fixed/small/slow-IV',
                            displayName: 'with-tags',
                            metadata: [{ type: 'tag'}]
                        }
                    }
                });
            })
            .then(function(response) {
                var data = response.data;
                expect(data.collection.displayName).toEqual('with-tags');
                expect(data.collection.metadata[0].type).toEqual('tag');
                front.querySelector('.cnf-collection:nth-child(2) > .cnf-collection__name').click();
                removeTag();
                return addTag(2);
            })
            .then(() => {
                expect(textInside('.fstChoiceItem').slice(0, -1)).toBe('secondTag');
                return saveCollection({
                    fronts: {
                        'test/front': {
                            collections: ['gossip', 'with-tags'],
                            priority: 'test'
                        }
                    },
                    collections: {
                        'with-tags': {
                            type: 'fixed/small/slow-IV',
                            displayName: 'with-tags',
                            metadata: [{ type: 'tag'}]
                        }
                    }
                });
            })
            .then((response) => {
                var data = response.data;
                expect(data.collection.metadata[0].type).toEqual('secondTag');
                return;
            });
        })
        .then(() => done())
        .catch(done.fail);

        function removeTag() {
            var deleteButton = dom.$('.fstChoiceItem > .fstChoiceRemove');
            deleteButton.click();
        }

        function saveCollection(response) {
            return configAction(mockConfig, baseModel, () => {
                $('button.tool').click();
                return response;
            });
        }

        function addTag(index) {
            const tagSelect = dom.$('.multipleInputDynamic');
            const fastselect = $.data(tagSelect, 'fastselect');
            fastselect.show();
            dom.click(tagSelect);
            return wait.ms(300)
            .then(() => {
                var result = dom.$('.fstResultItem:nth-child(' + index+ ')');
                return dom.click(result);
            });
        }

        function createFrontWithCollection () {
            return configAction(mockConfig, baseModel, () => {
                dom.click(dom.$('.title .linky'));
                dom.type($('.cnf-form input[type=text]'), 'test/front');
                dom.click(dom.$('.create-new-front'));

                var newFront = dom.$('.cnf-front.open');
                dom.click(newFront.querySelector('.tool--container'));
                dom.type(newFront.querySelector('.cnf-form input[type=text]'), 'gossip');

                dom.click(newFront.querySelector('.cnf-form .type-option-chosen'));
                dom.click(newFront.querySelector('.cnf-form .type-picker .type-option'));

                dom.click(newFront.querySelector('button.tool-save-container'));

                return {
                    fronts: {
                        'test/front': {
                            collections: ['gossip'],
                            priority: 'test'
                        }
                    },
                    collections: {
                        'gossip': {
                            type: 'fixed/small/slow-IV',
                            displayName: 'gossip'
                        }
                    }
                };
            });
        }

        function dragInsideTheSameCollection () {
            return configAction(mockConfig, baseModel, () => {
                // Open the front in the second panel
                var collectionToDrag = $('.contentPane:nth(0) .cnf-collection')[1];
                var collectionToDropTo = $('.contentPane:nth(0) .cnf-collection')[0];
                var droppableContainer = $('.contentPane:nth(0) .cnf-fronts .droppable')[0];
                var droppableTarget = drag.droppable(droppableContainer);
                var sourceCollection = new drag.Collection(collectionToDrag);

                droppableTarget.dragstart(collectionToDrag, sourceCollection);
                droppableTarget.drop(collectionToDropTo, sourceCollection);

                return {
                    fronts: {
                        'test/front': {
                            collections: ['gossip', 'sport'],
                            priority: 'test'
                        }
                    }
                };
            });
        }
    });

    it('allows for searching fronts', function (done) {
        this.testInstance = new ConfigLoader('?layout=config,search');
        var mockConfig = this.testInstance.mockConfig,
            baseModel;

        this.testInstance.load()
        .then(model => {
            baseModel = model;
            return dom.type($('input'), 'uk');
        })
        .then(() => {

            expect(textInside($('.contentPane:nth(1) .title--text:nth(0)'))).toEqual('uk');
            expect(textInside($('.contentPane:nth(1) .cnf-collection__name')[0])).toEqual('Latest News');

            $('.contentPane:nth(0) .title--text:nth(1)').click();

            return dragAnotherCollectionInsideFirstColumn(mockConfig, baseModel, $('.contentPane:nth(1) .cnf-collection')[0], {
                fronts: {
                    'world': {
                        collections: ['latest', 'environment'],
                        priority: 'test'
                    }
                }
            });
        })
        .then(function (request) {
            expect(request.front).toEqual('world');
            var data = request.data;
            expect(data.id).toEqual('world');
            expect(data.priority).toEqual('test');
            expect(data.collections).toEqual(['latest', 'environment']);
            expect(textInside($('.contentPane:nth(0) .cnf-fronts .droppable .cnf-collection__name')[0])).toEqual('Latest News');
            expect(textInside($('.contentPane:nth(0) .cnf-fronts .droppable .cnf-collection__name')[1])).toEqual('Environment');
        })
        .then(() => done())
        .catch(done.fail);

    });

    function dragAnotherCollectionInsideFirstColumn(mockConfig, baseModel, collectionToDrag, returnObject) {
        return configAction(mockConfig, baseModel, () => {
            var collectionToDropTo = $('.contentPane:nth(0) .cnf-fronts .cnf-collection')[0];
            var droppableContainer = $('.contentPane:nth(0) .cnf-fronts .droppable')[0];
            var droppableTarget = drag.droppable(droppableContainer);
            var sourceCollection = new drag.Collection(collectionToDrag);

            droppableTarget.dragstart(collectionToDrag, sourceCollection);
            droppableTarget.drop(collectionToDropTo, sourceCollection);

            return returnObject;
        });
    }

});
