import ko from 'knockout';
import * as contentApi from 'modules/content-api';
import {CONST} from 'modules/vars';
import asObservableProps from 'utils/as-observable-props';
import debounce from 'utils/debounce';
import BaseWidget from 'widgets/base-widget';

const queryApiSym = Symbol();

export default class CollectionBackfill extends BaseWidget {
    constructor(params) {
        super();

        this.meta = asObservableProps([
            'backfill',
            'apiQuery'
        ]);
        this.meta.backfill = params.backfill;
        populateMetaFromBackfill(this.meta);
        this.meta.apiQuery.extend({ deferred: true });

        this.state = asObservableProps([
            'queryStatus'
        ]);
        this.results = ko.observableArray();

        this.subscribeOn(this.meta.apiQuery, this.updateApiQuery);

        this[queryApiSym] = debounce(requestApiQueryStatus.bind(this), CONST.searchDebounceMs);
    }

    updateApiQuery() {
        const query = (this.meta.apiQuery() || '').replace(/\s+/g, '');
        this.meta.apiQuery(query);
        populateBackfillFromApiQuery(this.meta, query);
        this.checkApiQuery();
    }

    checkApiQuery() {
        this.checkQuery(this.meta.apiQuery(), queryApiSym);
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
}

function populateMetaFromBackfill(meta) {
    meta.apiQuery(meta.backfill());
}

function populateBackfillFromApiQuery(meta, query) {
    meta.backfill(query);
}

function requestApiQueryStatus(query) {
    const capiQuery = [query, 'show-fields=headline'].join(query.indexOf('?') === -1 ? '?' : '&');

    return contentApi.fetchContent(capiQuery, { forceLive: true });
}

function generateHref(item) {
    return Object.assign({}, {
        href: 'http://' + CONST.mainDomain + '/' + item.id
    }, item);
}
