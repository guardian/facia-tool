import ko from 'knockout';
import _ from 'underscore';
import Collection from 'models/collections/collection';
import Presser from 'modules/presser';
import {CONST} from 'modules/vars';
import {trackAction} from 'utils/analytics';
import lastModified from 'utils/fetch-lastmodified';
import humanTime from 'utils/human-time';
import mediator from 'utils/mediator';
import * as sparklines from 'utils/sparklines';
import ColumnWidget from 'widgets/column-widget';
import deepGet from 'utils/deep-get';
import modalDialog from 'modules/modal-dialog';
import isCodeEnvironment from 'utils/is-code-environment';

export default class Front extends ColumnWidget {
    constructor(params, element) {
        super(params, element);

        if (isCodeEnvironment(this.baseModel.state().defaults)) {
            this.baseModel.message.codeEnvMessage(true);
        }

        var frontId = params.column.config();
        this.front = ko.observable(frontId);
        this.previousFront = frontId;
        this.frontAge = ko.observable();
        this.collections = ko.observableArray();
        this.mode = ko.observable(params.mode || 'draft');
        this.flattenGroups = ko.observable(params.mode === 'treats');
        this.maxArticlesInHistory = this.confirmSendingAlert() ? 20 : 5;
        this.controlsVisible = ko.observable(false);
        this.authorized = ko.observable(isAuthorized(this.baseModel, frontId));
        this.isHidden = ko.observable();

        this.frontsList = ko.pureComputed(() => {
            return this.baseModel.frontsList().filter(front => {
                return CONST.askForConfirmation.indexOf(front.id) === -1;
            });
        });

        this.subscribeOn(this.front, this.onFrontChange);
        this.subscribeOn(this.mode, this.onModeChange);
        this.subscribeOn(this.baseModel.permissions, () => {
            this.authorized(isAuthorized(this.baseModel, this.front()));
        });

        this.setFront = id => this.front(id);
        this.setModeLive = () => {
            this.mode('live');
            trackAction('front', 'mode', 'live');
        };
        this.setModeDraft = () => {
            this.mode('draft');
            trackAction('front', 'mode', 'draft');
        };
        this.trackPreviewClick = () => {
            trackAction('outbound', 'preview', this.mode());
            return true;
        };

        this.frontMode = ko.pureComputed(() => {
            var classes = [this.mode() + '-mode'];
            if (this.confirmSendingAlert()) {
                classes.push('attention');
            }
            return classes.join(' ');
        });

        this.previewUrl = ko.pureComputed(() => {
            var path = this.mode() === 'live' ? 'https://' + CONST.viewerHost + '/proxy/live' : CONST.previewBase;

            return CONST.previewBase + '/responsive-viewer/' + path + '/' + this.front();
        });

        this.isControlsVisible = ko.observable(sparklines.isEnabled());
        this.controlsText = ko.pureComputed(() => {
            return 'Sparklines: ' + this.sparklinesOptions().hours + 'h';
        });

        this.ophanPerformances = ko.pureComputed(() => {
            return CONST.ophanFrontBase + encodeURIComponent('/' + this.front());
        });

        this.alertFrontIsStale = ko.observable();
        this.uiOpenArticle = ko.observable();

        this.allExpanded = ko.observable(true);

        this.listenOn(mediator, 'presser:lastupdate', (front, lastPressed) => {
            // The event :lastupdate is raised only for live events, lastUpdate includes draft changes
            if (front === this.front()) {
                this.frontAge(humanTime(lastPressed));
                if (this.baseModel.state().defaults.env !== 'dev') {
                    const stale = _.some(this.collections(), collection => {
                        const lastUpdated = new Date(collection.state.lastUpdated());
                        return _.isDate(lastUpdated) ? lastUpdated - lastPressed > CONST.detectPressFailureMs : false;
                    });
                    if (stale) {
                        mediator.emit('presser:stale', 'Sorry, the latest edit to the front \'' + front + '\' hasn\'t gone live.');
                    }
                }
            }
        });

        this.listenOn(mediator, 'ui:open', (element, article, front) => {
            if (front !== this) {
                return;
            }
            var openArticle = this.uiOpenArticle();
            if (openArticle && openArticle.group &&
                openArticle.group.parentType === 'Article' &&
                openArticle !== article) {
                openArticle.close();
            }
            this.uiOpenArticle(article);
        });

        this.listenOn(mediator, 'presser:live', this.pressLiveFront);
        this.listenOn(mediator, 'alert:dismiss', () => this.alertFrontIsStale(false));
        this.listenOn(mediator, 'collection:collapse', this.onCollectionCollapse);

        this.subscribeOn(this.column.config, newConfig => {
            if (newConfig !== this.front()) {
                this.front(newConfig);
            }
        });

        this.setIntervals = [];
        this.setTimeouts = [];
        this.refreshCollections(CONST.collectionsPollMs || 60000);
        this.refreshRelativeTimes(CONST.pubTimeRefreshMs || 60000);

        this.presser = new Presser();
        this.sparklinesOptions = ko.observable({
            hours: 1,
            interval: 10
        });
        if (this.authorized()) {
            this.load(frontId);
            sparklines.subscribe(this);
        } else {
            this.loaded = Promise.resolve(this);
        }
    }

    load(frontId) {
        if (frontId !== this.front()) {
            this.front(frontId);
        }
        const allCollections = this.baseModel.state().config.collections;
        const front = this.baseModel.frontsMap()[frontId] || {};
        this.isHidden(front.isHidden);
        this.allExpanded(true);
        this.collections(
            (front.collections || [])
            .filter(id => allCollections[id] && !allCollections[id].uneditable)
            .map(id => new Collection(
                _.extend(
                    allCollections[id],
                    {
                        id: id,
                        collectionsWhichAreAlsoOnOtherFronts: _.reduce(this.baseModel.allFrontsList(), (collectionsWhichAreAlsoOnOtherFronts, frontFromList) => {
                            if (frontFromList.id !== frontId && (frontFromList.collections || []).indexOf(id) > -1) {
                                collectionsWhichAreAlsoOnOtherFronts.push({
                                    id: frontFromList.id,
                                    priority: frontFromList.priority || 'editorial',
                                    isDifferentPriority: frontFromList.priority !== front.priority
                                });
                            }
                            return collectionsWhichAreAlsoOnOtherFronts;
                        }, []),
                        front: this
                    }
                )
            ))
        );

        this.getFrontAge({ alertIfStale: true });
        this.loaded = Promise.all(
            this.collections().map(collection => collection.loaded)
        ).then(() => mediator.emit('front:loaded', this));
    }

    pressLiveFront() {
        if (this.front()) {
            this.presser.press('live', this.front());
        }
    }

    pressDraftFront() {
        if (this.front()) {
            this.presser.press('draft', this.front());
        }
    }

    setSparklines(hours, interval) {
        this.sparklinesOptions({
            hours: hours,
            interval: interval
        });
    }

    getGroupName(name) {
        if (!this.confirmSendingAlert()) {
            return name;
        }
        return name === 'major' ? 'app & web' : 'web';
    }

    getFrontAge({alertIfStale = false} = {}) {
        if (this.front()) {
            lastModified(this.front()).then(last => {
                this.frontAge(last.human);
                if (this.baseModel.state().defaults.env !== 'dev') {
                    this.alertFrontIsStale(alertIfStale && last.stale);
                }
            });
        } else {
            this.frontAge(undefined);
        }
    }

    toggleAll() {
        var state = !this.allExpanded();
        this.allExpanded(state);
        _.each(this.collections(), collection => collection.state.collapsed(!state));
    }

    onCollectionCollapse(collection, collectionState) {
        if (collection.front !== this) {
            return;
        }
        var differentState = _.find(this.collections(), collection => collection.state.collapsed() !== collectionState);
        if (!differentState) {
            this.allExpanded(!collectionState);
        }
    }

    refreshCollections(period) {
        var length = this.collections().length || 1;
        this.setIntervals.push(setInterval(() => {
            this.collections().forEach((list, index) => {
                this.setTimeouts.push(setTimeout(() => list.refresh(), index * period / length)); // stagger requests
            });
        }, period));
    }

    refreshRelativeTimes(period) {
        this.setIntervals.push(setInterval(() => {
            this.collections().forEach(list => {
                list.refreshRelativeTimes();

                if (this.confirmSendingAlert) {
                    list.lastAlertSentHuman(list.getLastAlertHuman());
                }
            });
            this.getFrontAge();
        }, period));
    }

    onFrontChange(front) {
        if (front === this.previousFront) {
            // This happens when the page is loaded and the select is bound
            return;
        }
        this.previousFront = front;
        this.column.setConfig(front);

        this.load(front);

        if (this.mode() === 'draft') {
            this.pressDraftFront();
        }
    }

    onModeChange() {
        _.each(this.collections(), function(collection) {
            collection.closeAllArticles();
            collection.populate();
        });

        if (this.mode() === 'draft') {
            this.pressDraftFront();
        }
    }

    getCollectionList(list) {
        var sublist;
        if (this.mode() === 'treats') {
            sublist = list.treats;
        } else if (this.mode() === 'live') {
            sublist = list.live;
        } else {
            sublist = list.draft || list.live;
        }
        return sublist || [];
    }

    confirmSendingAlert() {
        return _.contains(CONST.askForConfirmation, this.front());
    }

    disableSnapLinks() {
        return _.contains(CONST.disableSnapLinks, this.front());
    }

    showIndicatorsEnabled() {
        return !this.confirmSendingAlert() && this.mode() !== 'treats';
    }

    slimEditor() {
        return _.contains(CONST.restrictedEditor, this.front());
    }

    newItemValidator(item) {
        return new Promise((resolve, reject) => {
            if (this.confirmSendingAlert() && !isOnlyArticle(item, this)) {
                reject('You can only have one article in this collection.');
            }

            if (item.meta.snapType() && this.disableSnapLinks()) {
                reject('You cannot use snap links in this collection.');
            }

            var defaults = this.baseModel.state().defaults;
            var groups = deepGet(item, '.group.parent.groups') || [];
            var containerType = groups[0].parent.configMeta.type();
            var collectionCap = containerType === defaults.navListType ? defaults.navListCap : defaults.collectionCap;
            var articleNumber = groups.reduce((numberOfArticles, group) => {
                return numberOfArticles + group.items().length;
            }, 0);

            if (articleNumber > collectionCap) {
                return modalDialog.confirm({
                    name: 'collection_cap_alert',
                    data: {
                        collectionCap: collectionCap
                    }
                }).then(function () {
                    return resolve(item);
                }, function () {
                    return reject();
                });
            }
            resolve();
        });
    }

    dispose() {
        super.dispose();
        _.each(this.setIntervals, clearInterval);
        _.each(this.setTimeouts, clearTimeout);
        sparklines.unsubscribe(this);
        this.presser.dispose();
    }
}

function isOnlyArticle (item, front) {
    var only = true,
        containingCollection = _.find(front.collections(), function (collection) {
            return _.find(collection.groups, function (group) {
                return group === item.group;
            });
        });

    containingCollection.eachArticle(function (article) {
        only = only && article.id() === item.id();
    });
    return only;
}

function isAuthorized (baseModel, frontId) {
    var permissions = baseModel.permissions() || {};
    return (permissions.fronts || {})[frontId] !== false;
}
