import ko from 'knockout';
import _ from 'underscore';
import DropTarget from 'models/drop-target';
import persistence from 'models/config/persistence';
import * as vars from 'modules/vars';
import alert from 'utils/alert';
import asObservableProps from 'utils/as-observable-props';
import observableNumeric from 'utils/observable-numeric';
import deepGet from 'utils/deep-get';
import fullTrim from 'utils/full-trim';
import populateObservables from 'utils/populate-observables';
import urlAbsPath from 'utils/url-abs-path';
import isPlatformSpecificCollection from 'utils/platform';
import CONST from 'constants/defaults';

export default class ConfigCollection extends DropTarget {
    constructor(opts = {}) {
        super();

        this.id = opts.id;

        const defaults = vars.model.state().defaults;

        this.parents = ko.observableArray(findParents(opts.id));
        this.userVisibilities = CONST.userVisibilities;
        this.availableTerritories = (defaults && defaults.availableTerritories) ? defaults.availableTerritories : [];

        this.meta = Object.assign(
            asObservableProps([
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
                'backfill',
                'description',
                'metadata',
                'platform',
                'frontsToolSettings',
                'userVisibility',
                'targetedTerritory',
                'suppressImages'
            ]),
            {
                displayHints: asObservableProps([
                    'maxItemsToDisplay'
                ], observableNumeric)
            },
            {
                frontsToolSettings: asObservableProps([
                    'displayEditWarning'
                ])
            }
        );

        populateObservables(this.meta, opts);

        this.state = asObservableProps([
            'isOpen',
            'isOpenTypePicker',
            'underDrag',
            'underControlDrag'
        ]);

        this.containerThumbnail = ko.pureComputed(() => {
            var containerId = this.meta.type();

            if (/^(fixed|dynamic|flexible|scrollable|static)\//.test(containerId)) {
                return '/thumbnails/' + containerId + '.svg';
            } else {
                return null;
            }
        });

        this.subscribeOn(this.meta.type, type => {
            this.meta.groups(vars.model.typesGroups[type]);
        });

        this.typePicker = this._typePicker.bind(this);

        this.thisIsPlatformSpecificCollection = isPlatformSpecificCollection(this.meta.platform());

        this.thisIsBetaCollection = ko.pureComputed(() => {
            return isBetaCollection(this.meta.type());
        });
    }


    getPlatform() {
        switch (this.meta.platform()) {
            case vars.CONST.platforms.app: return 'app only';
            case vars.CONST.platforms.web: return 'web only';
            default: return 'any';
        }
    }

    getDisplayName() {
        const platform = isPlatformSpecificCollection(this.meta.platform()) ? ` (${this.meta.platform()} only)` : '';
        return this.meta.displayName() + platform || '(no title)';
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
        const potentialErrors = [
            {key: 'displayName', errMsg: 'enter a title'},
            {key: 'type', errMsg: 'choose a layout'}
        ];

        const errs = _.chain(potentialErrors)
            .filter(test => !fullTrim(_.result(this.meta, test.key)))
            .pluck('errMsg')
            .value();

        const priority = vars.getPriority(frontEdited.getPriority());
        if (priority.hasGroups && !frontEdited.props.group()) {
            errs.push('choose a group');
        }


        if (errs.length) {
            const lastError = errs[errs.length - 1];
            const lastErrorJoiner = errs.length > 1 ? ', and ' : '';
            errs.splice(errs.length - 1);
            alert('Oops! You must ' + errs.join(', ') + lastErrorJoiner + lastError + '...');
            return;
        }

        this.meta.href(urlAbsPath(this.meta.href()));

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

function findParents (collectionId) {
    const frontsMap = vars.model.frontsMap();
    const state = vars.model.state();
    return _.chain(deepGet(state, '.config.fronts'))
        .map((front, frontId) => {
            return _.contains(front.collections, collectionId) ? frontsMap[frontId] : null;
        })
        .filter(Boolean)
        .value();
}

function isBetaCollection (collectionId) {
    return vars.CONST.betaCollectionTypes.includes(collectionId);
}
