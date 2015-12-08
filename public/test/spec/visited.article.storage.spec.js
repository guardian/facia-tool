import visitedArticleStorage from 'utils/visited-article-storage';
import * as storage from 'utils/local-storage';

describe('Visited Article Storage', function () {

    beforeEach(function () {
        localStorage.clear();
    });

    describe('addArticleToStorage', function () {
        it('adds an article to storage', function () {
            visitedArticleStorage.storage = storage.bind('visited-test-location');
            visitedArticleStorage.addArticleToStorage('article1');
            var item = visitedArticleStorage.storage.getItem();
            expect(item.length).toEqual(1);
            expect(item[0]).toEqual('article1');
        });

        it('should add an article to storage only once', function () {
            visitedArticleStorage.storage = storage.bind('visited-test-location');
            visitedArticleStorage.addArticleToStorage('article1');
            visitedArticleStorage.addArticleToStorage('article1');
            var item = visitedArticleStorage.storage.getItem();
            expect(item.length).toEqual(1);
        });
    });

    describe('isArticleVisited', function () {

        it('shoud return true for visited articles', function () {
            visitedArticleStorage.storage = storage.bind('visited-test-location');
            visitedArticleStorage.addArticleToStorage('article1');
            expect(visitedArticleStorage.isArticleVisited('article1')).toEqual(true);
        });

        it('shoud return false for unvisited articles', function () {
            visitedArticleStorage.storage = storage.bind('visited-test-location');
            visitedArticleStorage.addArticleToStorage('article1');
            expect(visitedArticleStorage.isArticleVisited('article2')).toEqual(false);
        });
    });
});

