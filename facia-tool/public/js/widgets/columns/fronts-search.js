import ko from 'knockout';
import _ from 'underscore';
import ColumnWidget from 'widgets/column-widget';
import * as vars from 'modules/vars';
import CONST from 'constants/defaults';
import Collection from 'models/config/collection';
import cloneWithKey from 'utils/clone-with-key';

export default class SearchConfig extends ColumnWidget {
    constructor(params, element) {
        super(params, element);
        this.searchTerm = ko.observable('');
        this.searchedFronts = ko.observableArray([]);
        var collectionDefinition = vars.model.state().config.collections;
        var originalFronts = _.reduce(this.baseModel.frontsList(), function (frontList, front) {

            if (_.every(CONST.askForConfirmation, function (element) {
                return front.id !== element;
            }) ) {

                front.groups = ko.observableArray(vars.CONST.frontGroups);
                front.collections = _.chain(front.collections)
                .map(id => {
                    if (collectionDefinition[id]) {
                        return new Collection(cloneWithKey(collectionDefinition[id], id));
                    }
                })
                .filter(collection => !!collection)
                .value();
                frontList.push(front);
            }
            return frontList;
        }, []);

        var self = this;
        this.searchTerm.subscribe(function (newTerms) {

            if (newTerms.length < 2) {
                self.searchedFronts([]);

            } else {

                newTerms = newTerms.toLowerCase();
                var allSearchTerms = newTerms.match(/\S+/g);;

                if (allSearchTerms.length === 1) {
                    self.searchedFronts(_.filter(originalFronts, function(front) {
                        return front.id.toLowerCase().indexOf(allSearchTerms[0]) !== -1 ||
                            isTermInCollections(front.collections, allSearchTerms[0]);
                    }) );

                } else {
                    let firstTerm = allSearchTerms[ 0 ];
                    let matchedFronts = _.filter(originalFronts, function(front) {
                        return front.id.toLowerCase().indexOf(firstTerm) !== -1;
                    });

                    if (matchedFronts.length > 0 ) {
                        allSearchTerms.splice(0, 1);
                        self.searchedFronts(searchForTermsInsideFrontCollections(allSearchTerms, matchedFronts));
                    } else {
                        self.searchedFronts(searchForTermsInsideFrontCollections(allSearchTerms, originalFronts));
                    }
                }
            }
        });

        function searchForTermsInsideFrontCollections(searchTerms, fronts) {
            return _.filter(fronts, function(front) {
                return _.every(searchTerms, function(term) {
                    return isTermInCollections(front.collections, term);
                });
            });
        }

        function isTermInCollections(collections, term) {
            return _.some(collections, function(collection) {
                return collection.meta.displayName().toLowerCase().indexOf(term) !== -1;
            });
        }
    }
}

