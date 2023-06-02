import ko from 'knockout';
import _ from 'underscore';
import * as contentApi from '../modules/content-api';
import * as vars from '../modules/vars';
import asObservableProps from '../utils/as-observable-props';
import debounce from '../utils/debounce';
import deepGet from '../utils/deep-get';
import sanitizeApiQuery from '../utils/sanitize-api-query';
import BaseWidget from './base-widget';

const queryApiSym = Symbol();

export default class CollectionBackfill extends BaseWidget {
    constructor(params) {
        super();

        this.meta = asObservableProps([
            'backfill',
            'apiQuery',
            'parentCollection'
        ]);
        this.meta.backfill = params.backfill;
        populateMetaFromBackfill(this.meta);
        this.meta.apiQuery.extend({ deferred: true });
        this.meta.parentCollection.extend({ deferred: true });

        this.state = asObservableProps([
            'queryStatus',
            'underDrag'
        ]);
        this.results = ko.observableArray();

        this.subscribeOn(this.meta.apiQuery, this.updateApiQuery);
        this.subscribeOn(this.meta.parentCollection, this.updateParentCollection);

        this[queryApiSym] = debounce(requestApiQueryStatus.bind(this), vars.CONST.searchDebounceMs);
    }

    updateApiQuery() {
        const query = (this.meta.apiQuery() || '').replace(/\s+/g, '');
        this.meta.apiQuery(query);
        populateBackfillFromApiQuery(this.meta, query);
        this.checkApiQuery();
    }

    updateParentCollection() {
        const query = this.meta.parentCollection();
        if (query) {
            populateBackfillFromParentCollection(this.meta, query.id);
            this.checkCollectionQuery();
        }
    }

    checkBackfill() {
        const backfill = this.meta.backfill();
        if (!backfill || typeof backfill === 'string') {
            this.checkApiQuery();
        } else if (backfill.type === 'capi') {
            this.checkApiQuery();
        } else if (backfill.type === 'collection') {
            this.checkCollectionQuery();
        }
    }

    checkApiQuery() {
        this.checkQuery(this.meta.apiQuery(), queryApiSym);
    }

    checkCollectionQuery() {
        this.state.queryStatus(null);
        this.results([]);
        this.emit('check:complete');
    }

    checkQuery(query, checkDebouncedFunction) {
        if (query) {
            this.state.queryStatus('check');
            this.results.removeAll();

            this[checkDebouncedFunction](query)
            .then((res = {}) => {
                const results = (res.content || [])
                    .filter(item => item.fields && item.fields.headline)
                    .map(generateHref);
                this.results(results);
                this.state.queryStatus(results.length ? 'valid' : 'invalid');
            })
            .catch(() => {
                this.results([]);
                this.state.queryStatus('invalid');
            })
            .then(() => this.emit('check:complete'));
        } else {
            this.state.queryStatus(null);
            this.results([]);
            this.emit('check:complete');
        }
    }

    underDrag(value) {
        this.state.underDrag(value);
    }

    drop(collection) {
        this.meta.parentCollection(extendCollectionObject(collection.id));
    }

    clearParentCollection() {
        this.meta.parentCollection(null);
        populateBackfillFromApiQuery(this.meta, this.meta.apiQuery());
    }
}

function populateMetaFromBackfill(meta) {
    const backfill = meta.backfill();
    if (!backfill || typeof backfill === 'string') {
        meta.apiQuery(backfill);
    } else if (backfill.type === 'capi') {
        meta.apiQuery(backfill.query);
    } else if (backfill.type === 'collection') {
        meta.parentCollection(extendCollectionObject(backfill.query));
    }
}

function populateBackfillFromApiQuery(meta, query) {
    const cleanedQuery = sanitizeApiQuery(query);
    if (cleanedQuery) {
        meta.backfill({
            type: 'capi',
            query: cleanedQuery
        });
    } else {
        meta.backfill(undefined);
    }
}

function populateBackfillFromParentCollection(meta, id) {
    meta.backfill({
        type: 'collection',
        query: id
    });
}

function extendCollectionObject(id) {
    const config = vars.model.state().config || {};
    const displayName = deepGet(config, '.collections.' + id + '.displayName') || 'unknown';
    const fronts = _.chain(config.fronts)
        .keys()
        .filter(frontId => _.contains(config.fronts[frontId].collections, id))
        .value();

    return { id, displayName, fronts };
}

function requestApiQueryStatus(query) {
    const capiQuery = [query, 'show-fields=headline'].join(query.indexOf('?') === -1 ? '?' : '&');

    return contentApi.fetchContent(capiQuery, { forceLive: true });
}

function generateHref(item) {
    return Object.assign({}, {
        href: 'http://' + vars.CONST.mainDomain + '/' + item.id
    }, item);
}
