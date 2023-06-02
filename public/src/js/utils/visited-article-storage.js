import * as storage from '../utils/local-storage';
import * as vars from '../modules/vars';
import _ from 'underscore';

let visitedArticleStorage = {};

function createStorage() {
    visitedArticleStorage.storage = storage.bind('gu.front-tools.visitedArticles.' + vars.model.identity.email);
}

function isArticleVisited(articleId) {
    if (!visitedArticleStorage.storage) {
        createStorage();
    }

    var visitedItems = visitedArticleStorage.storage.getItem();
    return _.some(visitedItems, function(visitedItem) {
        return visitedItem === articleId;
    });
}

function addArticleToStorage(articleId) {

    if (!visitedArticleStorage.storage) {
        createStorage();
    }

    var item = visitedArticleStorage.storage.getItem([]);
    if (!_.some(item, function (itemElement) {
        return itemElement === articleId;
    })) {
        item.unshift(articleId);
        item = item.slice(0, 500);
        visitedArticleStorage.storage.setItem(item);
    }
}

visitedArticleStorage.isArticleVisited = isArticleVisited;
visitedArticleStorage.addArticleToStorage = addArticleToStorage;

export default visitedArticleStorage;

