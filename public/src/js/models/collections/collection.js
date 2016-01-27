import ko from 'knockout';
import _ from 'underscore';
import $ from 'jquery';
import BaseClass from 'models/base-class';
import Article from 'models/collections/article';
import Group from 'models/group';
import * as authedAjax from 'modules/authed-ajax';
import * as contentApi from 'modules/content-api';
import modalDialog from 'modules/modal-dialog';
import * as vars from 'modules/vars';
import alert from 'utils/alert';
import asObservableProps from 'utils/as-observable-props';
import deepGet from 'utils/deep-get';
import humanTime from 'utils/human-time';
import mediator from 'utils/mediator';
import populateObservables from 'utils/populate-observables';
import reportErrors from 'utils/report-errors';

export default class Collection extends BaseClass {
    constructor(opts = {}) {
        super();

        if (!opts.id) { return; }

        this.id = opts.id;

        this.front = opts.front;

        this.raw = undefined;

        this.groups = this.createGroups(opts.groups);

        this.alsoOn = opts.alsoOn || [];

        this.isDynamic = opts.type.indexOf('dynamic/') === 0;

        this.dom = undefined;
        var onDomLoadResolve;
        var onDomLoad = new Promise(resolve => {
            onDomLoadResolve = resolve;
        });
        this.registerElement = element => {
            this.dom = element;
            onDomLoadResolve();
        };

        this.visibleStories = null;

        // properties from the config, about this collection
        this.configMeta   = asObservableProps([
            'type',
            'displayName',
            'hideShowMore',
            'href',
            'uneditable']);
        populateObservables(this.configMeta, opts);

        // properties from the collection itself
        this.collectionMeta = asObservableProps([
            'displayName',
            'href',
            'lastUpdated',
            'updatedBy',
            'updatedEmail']);

        this.state  = asObservableProps([
            'lastUpdated',
            'hasConcurrentEdits',
            'collapsed',
            'hasDraft',
            'pending',
            'editingConfig',
            'count',
            'timeAgo',
            'alsoOnVisible',
            'showIndicators',
            'hasExtraActions',
            'isHistoryOpen',
            'visibleCount']);

        this.itemDefaults = _.reduce({
            showTags: 'showKickerTag',
            showSections: 'showKickerSection'
        }, (defaults = {}, val, key) => {
            if (_.has(opts, key)) {
                defaults[val] = opts[key];
            }
            return defaults;
        }, undefined);

        this.history = ko.observableArray();
        this.state.isHistoryOpen(false);

        this.setPending(true);
        this.loaded = this.load().then(() => onDomLoad);
        this.state.visibleCount({});

        this.lastAlertSent = ko.pureComputed(this.getLastAlertTime, this);
    }

    setPending(asPending) {
        if (asPending) {
            this.state.pending(true);
        } else {
            setTimeout(() => this.state.pending(false));
        }
    }

    isPending() {
        return !!this.state.pending();
    }

    createGroups(groupNames) {
        return _.map(_.isArray(groupNames) ? groupNames : [undefined], (name, index) =>
            new Group({
                index: index,
                name: name,
                parent: this,
                parentType: 'Collection',
                omitItem: this.drop.bind(this),
                front: this.front
            })
        ).reverse(); // because groupNames is assumed to be in ascending order of importance, yet should render in descending order
    }

    toggleCollapsed() {
        const collapsed = !this.state.collapsed();
        this.state.collapsed(collapsed);
        this.closeAllArticles();
        mediator.emit('collection:collapse', this, collapsed);
    }

    toggleEditingConfig() {
        this.state.editingConfig(!this.state.editingConfig());
    }

    reset() {
        this.closeAllArticles();
        this.state.editingConfig(false);
        this.load();
    }

    addedInDraft() {
        const live = (this.raw || {}).live || [];

        return _.chain(this.groups)
            .map(group => group.items())
            .flatten()
            .filter(draftArticle =>
                !_.find(live, liveArticle => liveArticle.id === draftArticle.id())
            )
            .value();
    }

    publishDraft() {
        const addedInDraft = this.front.confirmSendingAlert() ? this.addedInDraft() : [];

        if (addedInDraft.length) {
            const isMajorAlert = !!_.find(addedInDraft, article => article.group.index === 1);

            modalDialog.confirm({
                name: 'confirm_breaking_changes',
                data: {
                    articles: addedInDraft,
                    target: this.configMeta.displayName(),
                    targetGroup: isMajorAlert ? 'APP & WEB' : 'WEB',
                    targetGroupClass: isMajorAlert ? 'major-alert' : 'minor-alert',
                    alertAlreadySent: article =>
                        _.find(this.history(), previously => previously.id() === article.id())
                }
            })
            .then(() => {
                // don't chain the promise
                this.processDraft(true, { sendAlert: true });
            })
            .catch(() => {});
        } else {
            this.processDraft(true, { sendAlert: false });
        }
    }

    discardDraft() {
        this.processDraft(false);
    }

    processDraft(goLive, opts = {}) {
        this.state.hasDraft(false);
        this.setPending(true);
        this.closeAllArticles();

        const detectPressFailures = goLive ? () => {
            mediator.emit('presser:detectfailures', this.front.front());
        } : () => {};

        authedAjax.request({
            type: 'post',
            url: vars.CONST.apiBase + '/collection/' + (goLive ? 'publish' : 'discard') + '/' + this.id,
            data: this.serializedCollectionWithMeta(opts.sendAlert)
        })
        .catch(error => {
            const errorMessages = [];
            try {
                errorMessages.push.apply(errorMessages, JSON.parse(error.responseText));
            } catch (ex) {
                errorMessages.push(error.responseText || error.message);
            }
            const message = 'Error when ' + (goLive ? 'publishing' : 'discarding')
                + ' the collection: ' + errorMessages.join('<br>');
            alert(message);
            reportErrors(new Error(message));
        })
        .catch(() => {})
        .then(() => this.load().then(detectPressFailures))
        .catch(() => {});
    }

    drop(item) {
        const mode = this.front.mode();
        this.setPending(true);

        this.state.showIndicators(false);
        const detectPressFailures = mode === 'live' ? () => {
            mediator.emit('presser:detectfailures', this.front.front());
        } : () => {};
        authedAjax.updateCollections({
            remove: {
                collection: this,
                item:       item.id(),
                mode:       mode
            }
        })
        .then(detectPressFailures)
        .catch(detectPressFailures);
    }

    load(opts = {}) {
        return authedAjax.request({
            url: vars.CONST.apiBase + '/collection/' + this.id
        })
        .then(raw => {
            if (opts.isRefresh && this.isPending()) { return; }
            if (!raw) { return; }

            // We need to wait for the populate
            this.state.hasConcurrentEdits(false);

            const wait = this.populate(raw);

            populateObservables(this.collectionMeta, raw);

            this.collectionMeta.updatedBy(raw.updatedEmail === deepGet(vars, '.model.identity.email') ? 'you' : raw.updatedBy);

            this.state.timeAgo(this.getTimeAgo(raw.lastUpdated));

            return wait;
        })
        .catch(ex => {
            // Network errors should be ignored
            if (ex instanceof Error) {
                reportErrors(ex);
            }
        })
        .then(() => {
            this.setPending(false);
        });
    }

    hasOpenArticles() {
        return _.some(this.groups, group =>
            _.some(group.items(), article => article.state.isOpen())
        );
    }

    isHistoryEnabled() {
        return this.front.mode() !== 'treats' && this.history().length;
    }

    replaceArticle(articleId) {
        const collectionList = this.front.getCollectionList(this.raw);

        const previousArticle = _.find(collectionList, item => item.id === articleId);
        if (previousArticle) {
            const previousArticleGroupIndex = parseInt((previousArticle.meta || {}).group, 10) || 0;
            const group = _.find(this.groups, group => group.index === previousArticleGroupIndex);
            const articleIndex = _.findIndex(group.items(), item => item.id() === articleId);

            const newArticle = new Article(_.extend({}, previousArticle, {
                group: group,
                slimEditor: _.result(this.front, 'slimEditor')
            }));

            group.items.splice(articleIndex, 1, newArticle);
            this.decorate();
        }
    }

    populate(rawCollection) {
        this.raw = rawCollection || this.raw;

        const loading = [];
        if (this.raw) {
            this.state.hasDraft(_.isArray(this.raw.draft));

            if (this.hasOpenArticles()) {
                this.state.hasConcurrentEdits(this.raw.updatedEmail !== vars.model.identity.email && this.state.lastUpdated());

            } else if (!rawCollection || this.raw.lastUpdated !== this.state.lastUpdated()) {
                const list = this.front.getCollectionList(this.raw);

                _.each(this.groups, group => group.items.removeAll());

                _.each(list, item => {
                    const itemGroupIndex = parseInt((item.meta || {}).group, 10) || 0;
                    const group = _.find(this.groups, g => itemGroupIndex === g.index) || this.groups[0];
                    const article = new Article(_.extend({}, item, {
                        group: group,
                        slimEditor: _.result(this.front, 'slimEditor')
                    }));

                    group.items.push(article);
                });

                this.populateHistory(this.raw.previously);
                this.state.lastUpdated(this.raw.lastUpdated);
                this.state.count(list.length);
                loading.push(this.decorate());
            }
        }

        this.setPending(false);
        return Promise.all(loading)
            .then(() => mediator.emit('collection:populate', this))
            .catch(() => {});
    }

    populateHistory(list) {
        if (!list || list.length === 0) {
            return;
        }
        this.state.hasExtraActions(true);

        list = list.slice(0, this.front.maxArticlesInHistory);
        this.history(_.map(list, opts =>
            new Article(_.extend({}, opts, {
                uneditable: true,
                slimEditor: _.result(this.front, 'slimEditor')
            }))
        ));
    }

    eachArticle(fn) {
        _.each(this.groups, group => {
            _.each(group.items(), item => {
                fn(item, group);
            });
        });
    }

    contains(article) {
        return _.some(this.groups, group =>
            _.some(group.items(), item => item === article)
        );
    }

    closeAllArticles() {
        this.eachArticle(item => item.close());
    }

    decorate() {
        const allItems = [];
        this.eachArticle(item => allItems.push(item));

        const done = contentApi.decorateItems(allItems);
        contentApi.decorateItems(this.history());

        return done;
    }

    refresh() {
        if (!this.isPending()) {
            this.load({ isRefresh: true });
        }
    }

    refreshRelativeTimes() {
        this.eachArticle(item => item.setRelativeTimes());
    }

    getTimeAgo(date) {
        return date ? humanTime(date) : '';
    }

    alsoOnToggle() {
        this.state.alsoOnVisible(!this.state.alsoOnVisible());
    }

    serializedCollectionWithMeta(sendAlert) {
        if (this.front.confirmSendingAlert()) {
            const items = [];
            const topic = this.configMeta.href();
            this.groups.forEach(group => {
                group.items().forEach(trail => {
                    items.push({
                        headline: trail.headline(),
                        group: group.name,
                        isArticle: !trail.meta.snapType(),
                        thumb: trail.thumbImage(),
                        image: trail.mainImage(),
                        imageHide: trail.meta.imageHide(),
                        path: trail.meta.snapType() ? trail.meta.href() : trail.state.capiId(),
                        shortUrl: trail.state.shortUrl(),
                        topic: topic,
                        alert: !!sendAlert
                    });
                });
            });
            return JSON.stringify({
                trails: items
            });
        }
    }

    dispose() {
        this.groups.forEach(group => group.dispose());
        if (this.visibleStories) {
            this.visibleStories.dispose();
        }
    }

    getLastAlertTime() {
        if (this.raw && this.raw.live.length > 0 && this.raw.live[0].frontPublicationDate) {
            return humanTime(this.raw.live[0].frontPublicationDate);
        }

        if (this.history().length > 0) {
            return this.history()[0].frontPublicationTime();
        }

        return 'No alerts sent';
    }


};

ko.bindingHandlers.indicatorHeight = {
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var target = ko.unwrap(valueAccessor()),
            numbers = bindingContext.$data.state.visibleCount(),
            container = bindingContext.$data.dom,
            top, bottomElementPosition, bottomElement, bottom, height;

        if (!(target in numbers) || !container) {
            return;
        }

        top = $(element).parents('.article-group')[0].getBoundingClientRect().top;
        bottomElementPosition = numbers[target] - 1;
        bottomElement = bottomElementPosition >= 0 ? container.querySelectorAll('.article')[bottomElementPosition] : null;
        bottom = bottomElement ? bottomElement.getBoundingClientRect().bottom : NaN;
        height = bottom - top - 15;

        element.style.height = (height || 0) + 'px';
    }
};
