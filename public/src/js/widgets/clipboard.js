import * as vars from '../modules/vars';
import ko from 'knockout';
import _ from 'underscore';
import BaseWidget from './base-widget';
import Article from '../models/collections/article';
import Group from '../models/group';
import * as contentApi from '../modules/content-api';
import copiedArticle from '../modules/copied-article';
import * as globalListeners from '../utils/global-listeners';
import * as storage from '../utils/local-storage';
import mediator from '../utils/mediator';

var classCount = 0;

class Clipboard extends BaseWidget {
    constructor(params) {
        super();

        this.storage = storage.bind('gu.front-tools.clipboard.' +
            (classCount ? classCount + '.' : '') + vars.model.identity.email);
        classCount += 1;
        this.column = params.column;
        this.group = new Group({
            parentType: 'Clipboard',
            keepCopy:  true,
            front: null
        });
        this.group.items(this.getItemsFromStorage());

        this.listenOn(mediator, 'copy:to:clipboard', this.copy);
        this.listenOn(copiedArticle, 'change', this.onCopiedChange);
        this.pollArticlesChange(this.saveInStorage.bind(this));

        this.hasCopiedArticle = ko.observable(false).extend({ notify: 'always' });
        this.inCopiedArticle = ko.pureComputed(this.getCopiedArticle, this);
        this.dropdownOpen = ko.observable(false);

        this.listenOn(globalListeners, 'paste', this.onGlobalPaste);
    }

    getCopiedArticle() {
        var inMemory = this.hasCopiedArticle() && copiedArticle.peek();

        return inMemory ? inMemory.displayName : null;
    }

    onCopiedChange(hasArticle) {
        this.hasCopiedArticle(hasArticle);
        if (!hasArticle) {
            this.dropdownOpen(false);
        }
    }

    clearAll() {
        this.group.omitAllItems();
    }

    flushCopiedArticles() {
        copiedArticle.flush();
    }

    onGlobalPaste(evt) {
        var activeElement = ((document.activeElement || {}).tagName || '').toLowerCase(),
            clipboard = evt.originalEvent.clipboardData.getData('Text');

        if (['input', 'textarea'].indexOf(activeElement) !== -1 || !/^(http[s]?:)?\/\//.test(clipboard)) {
            return;
        }

        mediator.emit('drop', {
            sourceItem: {
                id: clipboard
            }
        }, this.group, this.group);
    }

    getItemsFromStorage() {
        var group = this.group,
            items = _.map(this.storage.getItem() || [], function (item) {
                return new Article(_.extend(item, {
                    group: group
                }));
            });
        if (items.length) {
            contentApi.decorateItems(_.filter(items, function (item) {
                return !item.meta.snapType();
            }));
        }
        return items;
    }

    saveInStorage() {
        var allItems = _.map(this.group.items(), function (item) {
            return item.get();
        });
        this.storage.setItem(allItems);
    }

    pollArticlesChange(callback) {
        // Because I want to save intermediate states, in case the browser crashes
        // before the user clicks on 'save article', save regularly the current state
        this.pollID = setInterval(callback, vars.CONST.detectPendingChangesInClipboard);
    }

    copy(sourceItem) {
        mediator.emit('drop', {
            sourceItem: sourceItem
        }, this.group, this.group);
    }

    dispose() {
        super.dispose();
        this.group.dispose();
        clearInterval(this.pollID);
        classCount -= 1;
    }
}

export default Clipboard;
