import ko from 'knockout';
import _ from 'underscore';
import BaseClass from '../../models/base-class';
import Collection from '../../models/config/collection';
import persistence from '../../models/config/persistence';
import Group from '../../models/group';
import * as contentApi from '../../modules/content-api';
import * as vars from '../../modules/vars';
import asObservableProps from '../../utils/as-observable-props';
import cloneWithKey from '../../utils/clone-with-key';
import frontCount from '../../utils/front-count';
import populateObservables from '../../utils/populate-observables';
import generateCollections from '../../utils/generate-collections';
import {validateImageSrc} from '../../utils/validate-image-src';
import alert from '../../utils/alert';
import isPlatformSpecificCollection from '../../utils/platform';

export default class ConfigFront extends BaseClass {
    constructor(opts = {}) {
        super();

        this.id = ko.observable(opts.id);
        this.opts = opts;
        this.dom = null;

        this.props = asObservableProps([
            'navSection',
            'webTitle',
            'title',
            'description',
            'onPageDescription',
            'imageUrl',
            'imageWidth',
            'imageHeight',
            'isImageDisplayed',
            'isHidden',
            'priority',
            'group',
            'canonical']);

        populateObservables(this.props, opts);

        this.capiProps = asObservableProps([
            'section',
            'webTitle',
            'description']);

        this.state = asObservableProps([
            'collectionsCreated',
            'isOpen',
            'isOpenProps',
            'isValidMetadata']);
        this.state.isValidMetadata(true);

        this.applyConstraints();

        this.collections = new Group({
            parent: this,
            parentType: 'Front',
            items: ko.observableArray()
        });


        this.subscribeOn(this.props.priority, this.onChangePriority);
        this.subscribeOn(this.id, () => {
            this.validate(true);
            if (this.id()) {
                this.setOpen(true);
            }
        });
        this.subscribeOn(this.state.isOpen, () => {
            if (!this.state.collectionsCreated()) {
                this.state.collectionsCreated(true);
                this.collections.items(generateCollections(this.opts.collections));
            }
        });

        this.provisionalImageUrl = ko.observable();

        this.subscribeOn(this.props.imageUrl, src => this.provisionalImageUrl(src));
        this.provisionalImageUrl(this.props.imageUrl());

        this.subscribeOn(this.provisionalImageUrl, src => {
            if (!src) {
                this.props.imageUrl(undefined);
                this.props.imageWidth(undefined);
                this.props.imageHeight(undefined);
                this.props.isImageDisplayed(undefined);
            } else if (src !== this.props.imageUrl()) {
                validateImageSrc(src, {minWidth: 120})
                .then(img => {
                    this.props.imageUrl(img.src);
                    this.props.imageWidth(img.width);
                    this.props.imageHeight(img.height);
                    this.saveProps();
                }, err => {
                    this.provisionalImageUrl(undefined);
                    alert(err.message);
                });
            }
        });

        this.depopulateCollection = this._depopulateCollection.bind(this);

        this.placeholders = {};

        this.placeholders.navSection = ko.pureComputed(() => {
            var path = asPath(this.id()),
                isEditionalised = [].concat(vars.model.state().defaults.editions).some(edition => edition === path[0]);

            return this.capiProps.section() || (isEditionalised ? path.length === 1 ? undefined : path[1] : path[0]);
        });

        this.placeholders.webTitle = ko.pureComputed(() => {
            var path = asPath(this.id());

            return this.props.webTitle() || this.capiProps.webTitle() || (toTitleCase(path.slice(path.length > 1 ? 1 : 0).join(' ').replace(/-/g, ' ')) || this.id());
        });

        this.placeholders.title = ko.pureComputed(() => {
            var section = this.props.navSection() || this.placeholders.navSection();

            return this.props.title() || (this.placeholders.webTitle() + (section ? ' | ' + toTitleCase(section) : ''));
        });

        this.placeholders.description = ko.pureComputed(() => {
            return this.props.description() || this.capiProps.description() || ('Latest ' + this.placeholders.webTitle() + ' news, comment and analysis from the Guardian, the world\'s leading liberal voice');
        });

        this.placeholders.onPageDescription = ko.pureComputed(() => {
            return this.props.onPageDescription() || this.capiProps.description() || ('Latest ' + this.placeholders.webTitle() + ' news, comment and analysis from the Guardian, the world\'s leading liberal voice');
        });

        this.ophanPerformances = ko.pureComputed(() => {
            return vars.CONST.ophanFrontBase + encodeURIComponent('/' + this.id());
        });

        this.groups = ko.observableArray(vars.CONST.frontGroups);

        this.isNew = ko.observable(false);
    }

    createFront() {
        if (!this.id() || this.missingGroup()) {
            alert('You must select all properties');
            return;
        }

        if (vars.model.state().config.fronts[this.id()]) {
            alert('A front with this name exists already');
            return;
        }

        this.isNew(false);
    }

    missingGroup() {
        const priority = vars.getPriority(this.getPriority());
        return priority.hasGroups === true && !this.props.group();
    }

    updateConfig(config) {
        var originalConfig = this.opts;
        this.opts = config;
        populateObservables(this.props, config);
        if (!_.isEqual(originalConfig.collections, config.collections)) {
            if (this.state.collectionsCreated()) {
                this.collections.items(generateCollections(this.opts.collections));
            }
        } else {
            if (this.state.collectionsCreated()) {
                updateCollections(this.collections.items());
            }
        }
    }

    validate(checkUniqueness) {
        this.id((this.id() || '')
            .toLowerCase()
            .replace(/\/+/g, '/')
            .replace(/^\/|\/$/g, '')
            .replace(/[^a-z0-9/\-+]*/g, '')
            .split('/')
            .slice(0, 3)
            .join('/')
        );

        if (!this.id() || !checkUniqueness) { return; }

        var id = this.id();
        if (_.filter(vars.model.frontsList(), front => front.id === id).length > 1) {
            this.id(undefined);
        }
    }

    setOpen(isOpen, withOpenProps, scrollIntoView) {
        this.state.isOpen(isOpen);
        this.state.isOpenProps(withOpenProps);
        if (scrollIntoView) {
            this.dom.scrollIntoView();
        }
    }

    toggleOpen() {
        this.state.isOpen(!this.state.isOpen());
    }

    openProps() {
        this.state.isOpenProps(true);
        this.collections.items().forEach(collection => collection.close());

        contentApi.fetchMetaForPath(this.id())
        .then((meta = {}) => {
            _.each(this.capiProps, (val, key) => val(meta[key]));
        });
    }

    saveProps() {
        this.applyConstraints();
        this.state.isOpenProps(false);
        if (this.missingGroup()) {
            alert('You must choose a group');
            return;
        }
        const duplicates = this.getDuplicatePlatformSpecificCollections();
        if (duplicates.length) {
            alert('Cannot share platform-specific collections with other fronts - removing collection(s) from front \'' + this.props.webTitle() + '\' before saving');
            duplicates.forEach(c => this._depopulateCollection(c));
            // depopulateCollection takes care of persistence, so we return early here.
            return;
        }
        return persistence.front.update(this);
    }

     getDuplicatePlatformSpecificCollections() {
        return _.filter(
            this.collections.items(),
            c => isPlatformSpecificCollection(c.meta.platform()) && c.parents().length > 1
        );
    }

    isUniqueCollection(name) {
        //Checks if this is the only collection in this front with this name
        const others = this.collections.items().filter(c => c.meta.displayName() === name);
        return others.length < 2;
    }

    splitCollection(currentData, parents) {
        //Split an "Any" collection into Web + App collections if it belongs to only 1 front
        if (!isPlatformSpecificCollection(currentData.platform()) && parents().length <= 1) {
            var collection = new Collection(ko.toJS(currentData));
            collection.toggleOpen();
            collection.parents.push(this);
            collection.meta.platform(vars.CONST.platforms.app);

            this.collections.items.push(collection);

            currentData.platform(vars.CONST.platforms.web);
        }
    }

    changeToAnyPlatform(currentData) {
        if (this.isUniqueCollection(currentData.displayName())) {
            currentData.platform(vars.CONST.platforms.any);
        }
    }

    createCollection() {
        var collection = new Collection();

        collection.toggleOpen();
        collection.parents.push(this);
        this.collections.items.push(collection);
    }

    _depopulateCollection(collection) {
        collection.state.isOpen(false);
        collection.parents.remove(this);
        this.collections.items.remove(collection);
        if (this.props.canonical() === collection.id) {
            this.props.canonical(null);
        }

        // Save front without checking if it's valid
        // Groups are validated upon creation and editing anyway
        this.applyConstraints();
        this.state.isOpenProps(false);
        return persistence.front.update(this);
    }

    applyConstraints() {
        const priority = vars.getPriority(this.getPriority());
        if (priority.isTypeLocked) {
            this.state.isTypeLocked = true;
        }
        if (priority.isHiddenLocked) {
            this.props.isHidden(true);
        }
    }

    onChangePriority(newPriority) {
        var num = frontCount(vars.model.state().config.fronts, newPriority);

        if (num.count >= num.max) {
            this.state.isValidMetadata(false);
            alert('The maximum number of fronts (' + num.max + ') has been exceeded. Please delete one first, by removing all its collections.');
        } else {
            this.state.isValidMetadata(true);
        }
    }

    registerElement(dom) {
        this.dom = dom;
    }

    getPriority() {
        return this.props.priority() || vars.CONST.defaultPriority;
    }

    hasSamePriority(frontId) {
        const otherFront = vars.model.frontsMap()[frontId];
        return otherFront && otherFront.priority === this.props.priority();
    }

    showGroups() {
        return !!vars.getPriority(this.getPriority()).hasGroups;
    }

    dispose() {
        super.dispose();
        this.collections.dispose();
        this.dom = null;
    }
}

function updateCollections (collections) {
    var collectionDefinition = vars.model.state().config.collections;

    collections.forEach(collection => {
        let id = collection.id;
        if (collectionDefinition[id]) {
            // If the collection has no ID, it's because it was not saved yet
            // do not update it yet
            collection.updateConfig(cloneWithKey(collectionDefinition[id], id));
        }
    });
}

function toTitleCase(str) {
    return (str + '').replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function asPath(str) {
   return (str + '').split('/');
}
