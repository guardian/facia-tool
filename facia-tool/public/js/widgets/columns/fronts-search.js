import ko from 'knockout';
import _ from 'underscore';
import ColumnWidget from 'widgets/column-widget';
import CONST from 'constants/defaults';
import generateCollections from 'utils/generate-collections';

export default class SearchConfig extends ColumnWidget {
    constructor(params, element) {
        super(params, element);
        this.searchTerm = ko.observable('');
        this.searchedFronts = ko.observableArray([]);

        var self = this;
        var originalFronts;
        populateOriginalFrontList();
        this.subscribeOn(this.baseModel.state, populateOriginalFrontList);

        function populateOriginalFrontList() {
            originalFronts =  _.reduce(self.baseModel.frontsList(), function (frontList, front) {

                if (_.every(CONST.askForConfirmation, function (element) {
                    return front.id !== element;
                }) ) {
                    frontList.push({
                        id: front.id.toLowerCase(),
                        collections: generateCollections(front.collections)
                    });
                }
                return frontList;
            }, []);
        }

        this.searchTerm.subscribe(function (newTerms) {

            if (newTerms.length < 2) {
                self.searchedFronts([]);

            } else {

                newTerms = newTerms.toLowerCase();
                var allSearchTerms = newTerms.match(/\S+/g);

                if (allSearchTerms.length === 1) {
                    self.searchedFronts(_.filter(originalFronts, function(front) {
                        return front.id.indexOf(allSearchTerms[0]) !== -1 ||
                            isTermInCollections(front.collections, allSearchTerms[0]);
                    }) );

                } else {
                    let firstTerm = allSearchTerms[ 0 ];
                    let matchedFronts = _.filter(originalFronts, function(front) {
                        return front.id.indexOf(firstTerm) !== -1;
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
    }
}

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

