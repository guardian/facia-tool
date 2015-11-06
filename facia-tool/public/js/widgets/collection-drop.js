import _ from 'underscore';
import BaseWidget from 'widgets/base-widget';
import ko from 'knockout';
import * as vars from 'modules/vars';
import debounce from 'utils/debounce';
import * as contentApi from 'modules/content-api';
import {request} from 'modules/authed-ajax';

var apiQuerySym = Symbol();

export default class CollectionDrop extends BaseWidget {
    constructor(params) {
        super();
        this.apiQuery = ko.observable();
        this.displayName = ko.observable();
        this.backfill = params.backfill;
        this.apiResults = ko.observableArray();
        this.apiQueryStatus = ko.observable();
        this.displayName = ko.observable();

        this[apiQuerySym] = debounce(this.requestApiQueryStatus.bind(this), vars.CONST.searchDebounceMs);

        var that = this;
        this.apiQuery.subscribe(function(newValue) {
            if (!that.backfill() || that.backfill().type !== 'collection') {
                that.backfill({
                    value: newValue,
                    type: 'capiQuery'
                });
            }
            that.performApiQuery(newValue);
        });

        if (this.backfill()) {
            if (this.backfill().type === 'capiQuery') {
                this.apiQuery(this.backfill().value);
            } else {
                this.apiQuery('/collection/'+ this.backfill().id);
                this.displayName = ko.observable(vars.model.state().config.collections[this.backfill().id].displayName);
            }
        }

        this.underDrag = ko.observable(false);
    }

    removeCollection() {
        this.displayName('');
        this.apiQuery('');
        this.backfill(null);
        this.apiQueryStatus(undefined);
    }

    addData(data) {
        this.backfill({
            id: data.id,
            type: 'collection'
        });
        this.displayName(vars.model.state().config.collections[data.id].displayName);
        this.apiQuery('/collection/'+data.id);
        this.performApiQuery(this.apiQuery());
    }


    checkApiQueryStatus() {
        this.performApiQuery(this.apiQuery());
    }

    requestApiQueryStatus(apiQuery) {
        this.apiResults.removeAll();

        if (!apiQuery) {
            this.apiQueryStatus(undefined);
            return;
        }

        this.apiQueryStatus('check');

        if (this.backfill().type === 'capiQuery') {
            apiQuery += apiQuery.indexOf('?') < 0 ? '?' : '&';
            apiQuery += 'show-fields=headline';
            return contentApi.fetchContent(apiQuery);
        } else {
            return this.queryCollections(apiQuery);
        }
    }

    queryCollections(apiQuery) {
        return request({
            url: apiQuery
        })
        .then(function(response) {
            if (!response || response.live.length === 0) {
                return;
            } else {

                var articleIds =  _.map(response.live, function(liveArticle) {
                    return liveArticle.id;
                });

                return contentApi.fetchContentByIds(articleIds)
                    .then(function (response) {
                        return {content: response.content};
                    });
            }
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    performApiQuery(apiQuery) {
        apiQuery = apiQuery.replace(/\s+/g, '');
        if (apiQuery) {
            this.apiQuery(apiQuery);
            this[apiQuerySym](apiQuery)
            .then((res = {}) => {
                var results = res.content || [];
                this.apiResults(results);
                this.apiQueryStatus(results.length ? 'valid' : 'invalid');
            })
            .catch(() => {
                this.apiResults([]);
                this.apiQueryStatus('invalid');
            });
        } else {
            this.apiQueryStatus(null);
            this.apiResults([]);
        }
    }
}

