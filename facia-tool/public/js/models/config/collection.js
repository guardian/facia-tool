import ko from 'knockout';
import _ from 'underscore';
import DropTarget from 'models/drop-target';
import persistence from 'models/config/persistence';
import * as vars from 'modules/vars';
import asObservableProps from 'utils/as-observable-props';
import fullTrim from 'utils/full-trim';
import populateObservables from 'utils/populate-observables';
import urlAbsPath from 'utils/url-abs-path';
import sanitizeApiQuery from 'utils/sanitize-api-query';

export default class ConfigCollection extends DropTarget {
    constructor(opts = {}) {
        super();

        this.id = opts.id;

        this.parents = ko.observableArray(findParents(opts.id));

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
            'description',
            'backfill']);

        populateObservables(this.meta, opts);
        convertToNewBackfillFormat(this.meta, opts);

        this.state = asObservableProps([
            'isOpen',
            'isOpenTypePicker',
            'underDrag',
            'underControlDrag']);

        this.containerThumbnail = ko.pureComputed(() => {
            var containerId = this.meta.type();

            if (/^(fixed|dynamic)\//.test(containerId)) {
                return '/thumbnails/' + containerId + '.svg';
            } else {
                return null;
            }
        });

        this.subscribeOn(this.meta.type, type => {
            this.meta.groups(vars.model.typesGroups[type]);
        });

        this.typePicker = this._typePicker.bind(this);

        function convertToNewBackfillFormat(meta, opts) {
            if (opts.backfill) {
                return;
            } else if (opts.apiQuery) {
                meta.backfill({
                    type: 'capiQuery',
                    value: opts.apiQuery
                });
            }
        }
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

    save() {
        var errs = _.chain([
                {key: 'displayName', errMsg: 'enter a title'},
                {key: 'type', errMsg: 'choose a layout'}
            ])
            .filter(test => !fullTrim(_.result(this.meta, test.key)))
            .pluck('errMsg')
            .value();

        if (errs.length) {
            window.alert('Oops! You must ' + errs.join(', and ') + '...');
            return;
        }

        this.meta.href(urlAbsPath(this.meta.href()));
        this.meta.backfill(sanitizeApiQuery(this.meta.backfill()));

        this.state.isOpen(false);

        persistence.collection.save(this);
    }

    updateConfig(opts) {
        populateObservables(this.meta, opts);
        this.parents(findParents(this.id));
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
