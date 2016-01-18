import ko from 'knockout';
import _ from 'underscore';
import DropTarget from 'models/drop-target';
import persistence from 'models/config/persistence';
import * as contentApi from 'modules/content-api';
import * as vars from 'modules/vars';
import asObservableProps from 'utils/as-observable-props';
import debounce from 'utils/debounce';
import fullTrim from 'utils/full-trim';
import populateObservables from 'utils/populate-observables';
import sanitizeApiQuery from 'utils/sanitize-api-query';
import urlAbsPath from 'utils/url-abs-path';
import alert from 'utils/alert';

var apiQuerySym = Symbol();

export default class ConfigCollection extends DropTarget {
    constructor(opts = {}) {
        super();

        this.id = opts.id;

        this.parents = ko.observableArray(findParents(opts.id));

        this.capiResults = ko.observableArray();

        this.meta = asObservableProps([
            'displayName',
            'href',
            'groups',
            'type',
            'uneditable',
            'showTags',
            'showSections',
            'hideKickers',
            'showDateHeader',
            'showLatestUpdate',
            'showTimestamps',
            'excludeFromRss',
            'hideShowMore',
            'apiQuery',
            'description']);

        populateObservables(this.meta, opts);

        this.state = asObservableProps([
            'isOpen',
            'isOpenTypePicker',
            'underDrag',
            'underControlDrag',
            'apiQueryStatus']);

        this.containerThumbnail = ko.pureComputed(() => {
            var containerId = this.meta.type();

            if (/^(fixed|dynamic)\//.test(containerId)) {
                return '/thumbnails/' + containerId + '.svg';
            } else {
                return null;
            }
        });

        this[apiQuerySym] = debounce(this.requestApiQueryStatus.bind(this), vars.CONST.searchDebounceMs);
        this.subscribeOn(this.meta.apiQuery, this.performApiQuery);

        this.subscribeOn(this.meta.type, type => {
            this.meta.groups(vars.model.typesGroups[type]);
        });

        this.typePicker = this._typePicker.bind(this);
    }

    toggleOpen() {
        this.state.isOpen(!this.state.isOpen());
    }

    toggleOpenTypePicker() {
        this.state.isOpenTypePicker(!this.state.isOpenTypePicker());
    }

    _typePicker(type) {
        this.meta.type(type);
        this.state.isOpenTypePicker(false);
    }

    close() {
        this.state.isOpen(false);
    }

    /** IDs of fronts to which the collection belongs */
    frontIds() {
        return _.chain(this.parents())
            .map(front => _.result(front, 'id'))
            .filter(_.identity)
            .value();
    }

    save(frontEdited) {
        var potentialErrors = [
            {key: 'displayName', errMsg: 'enter a title'},
            {key: 'type', errMsg: 'choose a layout'},
        ];

        var errs = _.chain(potentialErrors)
            .filter(test => !fullTrim(_.result(this.meta, test.key)))
            .pluck('errMsg')
            .value();

        if (vars.model.priority === 'commercial' && !frontEdited.props.group()) {
            errs.push('choose a group');
        }



        if (errs.length) {
            var lastError = errs[errs.length - 1];
            var lastErrorJoiner = errs.length > 1 ? ', and ' : '';
            errs.splice(errs.length - 1);
            alert('Oops! You must ' + errs.join(', ') + lastErrorJoiner + lastError + '...');
            return;
        }

        this.meta.href(urlAbsPath(this.meta.href()));
        this.meta.apiQuery(sanitizeApiQuery(this.meta.apiQuery()));

        this.state.apiQueryStatus(undefined);
        this.state.isOpen(false);

        persistence.collection.save(this);
    }

    updateConfig(opts) {
        populateObservables(this.meta, opts);
        this.parents(findParents(this.id));
    }

    checkApiQueryStatus() {
        this.performApiQuery(this.meta.apiQuery());
    }

    performApiQuery(apiQuery) {
        if (this.state.isOpen()) {
            apiQuery = apiQuery.replace(/\s+/g, '');
            if (apiQuery) {
                this.meta.apiQuery(apiQuery);
                this[apiQuerySym](apiQuery)
                .then((res = {}) => {
                    var results = (res.content || []).filter(item => item.fields && item.fields.headline);
                    this.capiResults(results);
                    this.state.apiQueryStatus(results.length ? 'valid' : 'invalid');
                })
                .catch(() => {
                    this.capiResults([]);
                    this.state.apiQueryStatus('invalid');
                });
            } else {
                this.state.apiQueryStatus(null);
                this.capiResults([]);
            }
        }
    }

    requestApiQueryStatus(apiQuery) {
        this.capiResults.removeAll();

        if (!apiQuery) {
            this.state.apiQueryStatus(undefined);
            return;
        }

        this.state.apiQueryStatus('check');

        apiQuery += apiQuery.indexOf('?') < 0 ? '?' : '&';
        apiQuery += 'show-fields=headline';

        return contentApi.fetchContent(apiQuery, { forceLive: true });
    }

    get() {
        return {
            id: this.id,
            type: vars.CONST.draggableTypes.configCollection
        };
    }
}

function findParents (id) {
    return _.chain(vars.model.frontsList())
        .filter(front => _.contains(front.collections, id))
        .value();
}
