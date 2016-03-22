import ko from 'knockout';
import _ from 'underscore';
import * as contentApi from 'modules/content-api';
import modalDialog from 'modules/modal-dialog';
import tagManager from 'modules/tag-manager';
import * as vars from 'modules/vars';
import alert from 'utils/alert';
import asObservableProps from 'utils/as-observable-props';
import debounce from 'utils/debounce';
import deepGet from 'utils/deep-get';
import sanitizeApiQuery from 'utils/sanitize-api-query';
import BaseWidget from 'widgets/base-widget';

const queryApiSym = Symbol();

export default class CollectionBackfill extends BaseWidget {
    constructor(params) {
        super();

        this.meta = asObservableProps([
            'backfill',
            'apiQuery',
            'parentCollection',
            'parentFrontMetadata'
        ]);
        this.meta.backfill = params.backfill;
        populateMetaFromBackfill(this.meta);
        this.meta.apiQuery.extend({ deferred: true });
        this.meta.parentCollection.extend({ deferred: true });
        this.meta.parentFrontMetadata.extend({ deferred: true });

        this.state = asObservableProps([
            'queryStatus',
            'underDrag'
        ]);
        this.state.visibleContainer = ko.pureComputed(this.visibleContainer, this);
        this.results = ko.observableArray();

        this.subscribeOn(this.meta.apiQuery, this.updateApiQuery);
        this.subscribeOn(this.meta.parentCollection, this.updateParentCollection);
        this.subscribeOn(this.meta.parentFrontMetadata, this.updateParentFrontMetadata);

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

    updateParentFrontMetadata() {
        const query = this.meta.parentFrontMetadata();
        if (query) {
            populateBackfillFromParentFront(this.meta, query.frontId, query.metadataId);
            this.checkFrontMetadataQuery();
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
        } else if (backfill.type === 'front-metadata') {
            this.checkFrontMetadataQuery();
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

    checkFrontMetadataQuery() {
        const query = this.meta.parentFrontMetadata() || {};
        const targetCollection = extractCollectionWithMetadata(query.frontId, query.metadataId);

        this.state.queryStatus('valid');
        this.results(targetCollection ?
            [targetCollection.displayName] :
            ['None of the collections in ' + query.frontId + ' have metadata ' + query.metadataId]
        );
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

    drop(sourceItem) {
        if (sourceItem.type === vars.CONST.draggableTypes.configCollection) {
            this.meta.parentCollection(extendCollectionObject(sourceItem.id));
        } else if (sourceItem.type === vars.CONST.draggableTypes.configFront) {
            this.selectTagForParentFront(sourceItem.id);
        } else {
            throw new Error('Invalid sourceItem');
        }
    }

    clearBackfilledElement() {
        this.meta.parentCollection(null);
        this.meta.parentFrontMetadata(null);
        populateBackfillFromApiQuery(this.meta, this.meta.apiQuery());
    }

    selectTagForParentFront(id) {
        tagManager.getTags()
        .then(list => {
            const pickerModel = {
                frontId: id,
                tags: list,
                value: ko.observable(list[0])
            };

            modalDialog.confirm({
                name: 'select_tag_for_front_backfill',
                data: pickerModel
            })
            .then(() => {
                this.meta.parentFrontMetadata({
                    frontId: id,
                    metadataId: pickerModel.value()
                });
            }, () => {
                // Nothing to do if cancel selection
            });
        })
        .catch(() => {
            alert('Unable to get the list of tags. Please try again later.');
        });
    }

    visibleContainer() {
        const backfill = this.meta.backfill();
        return backfill ? backfill.type || 'capi' : 'capi';
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
    } else if (backfill.type === 'front-metadata') {
        meta.parentFrontMetadata(extendParentMetadata(backfill.query));
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

function populateBackfillFromParentFront(meta, frontId, metadataId) {
    meta.backfill({
        type: 'front-metadata',
        query: frontId + '|' + metadataId
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

function extendParentMetadata(query) {
    const [frontId, metadataId] = query.split('|');
    return { frontId, metadataId };
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

function extractCollectionWithMetadata(frontId, metadataId) {
    const config = vars.model.state().config || {};
    const collections = deepGet(config, '.fronts.' + frontId + '.collections') || [];
    const collectionWithMetadata = _.find(collections, (collectionId) => {
        const metadata = deepGet(config, '.collections.' + collectionId + '.metadata') || [];
        return metadata.includes(metadataId);
    });
    return deepGet(config, '.collections.' + collectionWithMetadata);
}
