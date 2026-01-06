import $ from 'jquery';
import ko from 'knockout';
import _ from 'underscore';

import metaFields from 'constants/article-meta-fields';

import {headline, headlineLength, headlineLengthAlert} from 'models/article/headline';
import {displayLabel} from 'models/article/display-editor';
import {thumbnail, main as mainImage} from 'models/article/images';
import Editor from 'models/article/editor';
import {default as assignState} from 'models/article/transform';
import persistence from 'models/collections/persistence';
import DropTarget from 'models/drop-target';
import Group from 'models/group';
import {getViewUrl} from 'models/article/links';

import * as contentApi from 'modules/content-api';
import copiedArticle from 'modules/copied-article';

import {trackAction} from 'utils/analytics';
import articleCollection from 'utils/article-collection';
import asObservableProps from 'utils/as-observable-props';
import deepGet from 'utils/deep-get';
import humanTime from 'utils/human-time';
import isGuardianUrl from 'utils/is-guardian-url';
import isPreviewUrl from 'utils/is-preview-url';
import logger from 'utils/logger';
import mediator from 'utils/mediator';
import openGraph from 'utils/open-graph';
import populateObservables from 'utils/populate-observables';
import serializeArticleMeta from 'utils/serialize-article-meta';
import * as snap from 'utils/snap';
import urlAbsPath from 'utils/url-abs-path';
import visitedArticleStorage from 'utils/visited-article-storage';
import { metaFieldsForPage } from '../../utils/modify-fields-for-breaking-news';

const capiProps = [
    'webUrl',
    'webPublicationDate',
    'sectionName'];

const capiFields = [
    'headline',
    'trailText',
    'byline',
    'isLive',
    'firstPublicationDate',
    'scheduledPublicationDate',
    'thumbnail',
    'secureThumbnail'];

export default class Article extends DropTarget {
    constructor(opts = {}, withCapiData) {
        super();
        this.id = ko.observable(opts.id);

        this.group = opts.group;
        this.front = deepGet(opts, '.group.front');

        this.props = asObservableProps(capiProps);
        this.props.webPublicationDate.extend({ notify: 'always' });

        this.fields = asObservableProps(capiFields);

        this.meta = asObservableProps(_.pluck(metaFields, 'key'));
        populateObservables(this.meta, opts.meta);

        this.metaDefaults = {};

        this.collectionMetaDefaults = deepGet(opts, '.group.parent.itemDefaults');

        this.uneditable = opts.uneditable;

        this.slimEditor = opts.slimEditor;

        this.state = asObservableProps([
            'enableContentOverrides',
            'underDrag',
            'underControlDrag',
            'isOpen',
            'isLiveBlog',
            'isLoaded',
            'isEmpty',
            'visited',
            'inDynamicCollection',
            'inFlexibleCollection',
			'inFlexibleGeneralCollection',
            'tone',
            'primaryTag',
            'sectionName',
            'hasMainVideo',
            'imageSrcFromCapi',
            'imageCutoutSrcFromCapi',
            'viewUrl',
            'ophanUrl',
            'sparkUrl',
            'capiId',
            'shortUrl',
            'premium']);

        this.state.enableContentOverrides(this.meta.snapType() !== 'latest');
        this.state.inDynamicCollection(deepGet(opts, '.group.parent.isDynamic'));
        this.state.inFlexibleCollection(deepGet(opts, '.group.parent.isFlexible'));
		this.state.inFlexibleGeneralCollection(deepGet(opts, '.group.parent.isFlexibleGeneral'));
        this.state.visited(opts.visited);
        this.frontPublicationDate = opts.frontPublicationDate;
        this.publishedBy = opts.publishedBy;
        this.frontPublicationTime = ko.observable();
        this.scheduledPublicationTime = ko.observable();

        this.editors = ko.observableArray();
        this.editorsDisplay = ko.observableArray();

        this.headline = ko.pureComputed(headline, this);
        this.headlineLength = ko.pureComputed(headlineLength, this);
        this.headlineLengthAlert = ko.pureComputed(headlineLengthAlert, this);

        this.webPublicationTime = ko.pureComputed(this.getWebPublicationHumanTime, this);

        this.thumbImage = ko.pureComputed(thumbnail, this);
        this.mainImage = ko.pureComputed(mainImage, this);

        // Populate supporting
        if (this.group && this.group.parentType !== 'Article') {
            this.meta.supporting = new Group({
                parent: this,
                parentType: 'Article',
                omitItem: this.save.bind(this),
                front: this.front
            });

            this.meta.supporting.items(_.map((opts.meta || {}).supporting, (item) => {
                return new Article(_.extend(item, {
                    group: this.meta.supporting
                }));
            }));

            contentApi.decorateItems(this.meta.supporting.items());

            this.addViewUrl();

        }

        if (withCapiData) {
            this.addCapiData(opts);
        } else {
            this.updateEditorsDisplay();
        }
    }

    getWebPublicationHumanTime() {
        return humanTime(this.props.webPublicationDate());
    }

    copy() {
        copiedArticle.set(this);
        trackAction('trail', 'copy', !!this.front);
    }

    copyToClipboard() {
        mediator.emit('copy:to:clipboard', this.get());
        trackAction('trail', 'toClip', !!this.front);
    }

    setVisitedToTrue() {
        visitedArticleStorage.addArticleToStorage(this.id());
        mediator.emit('set:article:to:visited', this.id());
        trackAction('trail', 'open', !!this.front);
        return true;
    }

    paste() {
        const sourceItem = copiedArticle.get(true);

        if (sourceItem && sourceItem.id !== this.id()) {
            mediator.emit('drop', {
                sourceItem: sourceItem.article.get(),
                sourceGroup: sourceItem.group
            }, this, this.group);
            trackAction('trail', 'paste', !!this.front);
        }
    }

    addCapiData(opts) {
        var missingProps;

        populateObservables(this.props, opts);
        populateObservables(this.fields, opts.fields);

        this.setRelativeTimes();

        missingProps = [
            'webUrl',
            'fields',
            'fields.headline'
        ].filter(function(prop) {return !deepGet(opts, prop); });

        if (missingProps.length) {
            mediator.emit('capi:error', 'ContentApi is returning invalid data. Fronts may not update.');
            logger.error('ContentApi missing: "' + missingProps.join('", "') + '" for ' + this.id());
        } else {
            this.state.isLoaded(true);
            assignState(opts, this);

            this.metaDefaults = _.extend(deepGet(opts, '.frontsMeta.defaults') || {}, this.collectionMetaDefaults);
            populateObservables(this.meta, this.metaDefaults);

            this.updateEditorsDisplay();
        }
    }

    updateEditorsDisplay() {
        if (!this.uneditable) {
            this.editorsDisplay(metaFields.map(displayLabel, this).filter(Boolean));
        }
    }

    setRelativeTimes() {
        this.frontPublicationTime(humanTime(this.frontPublicationDate));
        this.scheduledPublicationTime(humanTime(this.fields.scheduledPublicationDate()));
    }

    get() {
        const asObject = {
            id: this.id()
        };
        const meta = serializeArticleMeta(this);
        if (meta) {
            asObject.meta = meta;
        }
        return asObject;
    }

    normalizeDropTarget() {
        return {
            isAfter: false,
            target: this
        };
    }

    save() {
        return persistence.article.save(this);
    }

    convertToSnap() {
        const id = this.id();
        let href;

        if (isGuardianUrl(id) || isPreviewUrl(id)) {
            href = '/' + urlAbsPath(id, true);
        } else {
            href = id;
        }

        this.meta.href(href);
        this.id(snap.generateId());

        this.addViewUrl();

        this.updateEditorsDisplay();
    }

    convertToLinkSnap() {
        if (!this.meta.headline()) {
            this.decorateFromOpenGraph();
        }

        this.meta.snapType('link');

        this.convertToSnap();
    }

    convertToLatestSnap(kicker) {
        this.meta.snapType('latest');
        this.meta.snapUri(urlAbsPath(this.id()));

        this.meta.showKickerCustom(true);
        this.meta.customKicker(kicker);

        this.meta.headline(undefined);
        this.meta.trailText(undefined);
        this.meta.byline(undefined);

        this.state.enableContentOverrides(false);

        this.convertToSnap();
    }

    addViewUrl() {
        const viewUrl = getViewUrl(this);
        if (viewUrl) {
            this.state.viewUrl(viewUrl);
        }
    }

    decorateFromOpenGraph() {
        this.meta.headline('Fetching headline...');

        return openGraph(this.id())
        .then(data => {
            this.meta.headline(data.title);
            this.meta.trailText(data.description);

            if (data.siteName) {
                this.meta.byline(data.siteName);
                this.meta.showByline(true);
            }
        })
        .catch(() => {
            this.meta.headline('Invalid page');
        })
        .then(() => {
            this.updateEditorsDisplay();
        });
    }

    open(article, evt) {
        if (this.uneditable) { return; }

        if (this.meta.supporting) {
            this.meta.supporting.items().forEach(sublink => sublink.close());
        }

        const collection = articleCollection(this);
        if (!this.state.isOpen()) {
            const metaFieldsForEditors = metaFieldsForPage();
            this.editors(metaFieldsForEditors.map(field => Editor.create(field, this, metaFieldsForEditors)).filter(Boolean));
            this.state.isOpen(true);
            mediator.emit(
                'ui:open',
                _.chain(this.editors())
                 .filter(function(editor) { return editor.type === 'text' && editor.displayEditor(); })
                 .map(function(editor) { return editor.meta; })
                 .first()
                 .value(),
                this,
                this.front,
                collection
            );
        } else {
            mediator.emit('ui:open', null, null, this.front, collection);
        }

        if ($(evt.target).hasClass('allow-default-click')) {
            return true;
        }
    }

    close() {
        if (this.state.isOpen()) {
            this.state.isOpen(false);
            this.updateEditorsDisplay();
            cleanEditors(this.editors);
        }
        mediator.emit('ui:close', {
            targetGroup: this.group
        }, articleCollection(this));
    }

    closeAndSave() {
        this.close();
        this.save();
        return false;
    }

    closeWithoutSaving() {
        this.close();
        if (this.group && this.group.parentType === 'Collection') {
            this.group.parent.replaceArticle(this.id());
        }
        return false;
    }

    clickOphan () {
        trackAction('trail', 'stats', !!this.front);
        return true;
    }

    omitItem() {
        this.group.omitItem(this);
        trackAction('trail', 'remove', !!this.front);
    }

    dispose() {
        if (this.meta.supporting) {
            this.meta.supporting.dispose();
        }
        cleanEditors(this.editors);
    }
}

function cleanEditors(editors) {
    editors().forEach(editor => editor.dispose());
    editors.removeAll();
}
