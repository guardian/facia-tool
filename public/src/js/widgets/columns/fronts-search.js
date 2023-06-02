import ko from 'knockout';
import _ from 'underscore';
import ColumnWidget from '../column-widget';
import CONST from '../../constants/defaults';
import generateCollections from '../../utils/generate-collections';

export default class SearchConfig extends ColumnWidget {
    constructor(params, element) {
        super(params, element);
        this.searchTerm = ko.observable('');
        this.searchedFronts = ko.observableArray([]);
        this.originalFronts;

        this.populateOriginalFrontList();
        this.subscribeOn(this.baseModel.state, this.populateOriginalFrontList);
        this.subscribeOn(this.searchTerm, this.search);

    }

    populateOriginalFrontList() {
        this.originalFronts = _.reduce(this.baseModel.frontsList(), function (frontList, front) {

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

    search() {
        if (this.searchTerm().length < 2) {
            this.searchedFronts([]);

        } else {

            var allSearchTerms = this.searchTerm().toLowerCase().match(/\S+/g);

            if (allSearchTerms.length === 1) {
                this.searchedFronts(_.filter(this.originalFronts, function(front) {
                    return front.id.indexOf(allSearchTerms[0]) !== -1 ||
                    isTermInCollections(front.collections, allSearchTerms[0]);
                }) );

            } else {
                let firstTerm = allSearchTerms[ 0 ];
                let matchedFronts = _.filter(this.originalFronts, function(front) {
                    return front.id.indexOf(firstTerm) !== -1;
                });

                if (matchedFronts.length > 0 ) {
                    allSearchTerms.splice(0, 1);
                    this.searchedFronts(searchForTermsInsideFrontCollections(allSearchTerms, matchedFronts));
                } else {
                    this.searchedFronts(searchForTermsInsideFrontCollections(allSearchTerms, this.originalFronts));
                }
            }
        }
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
        return collection.meta.displayName() && collection.meta.displayName().toLowerCase().indexOf(term) !== -1;
    });
}

