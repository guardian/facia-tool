import testConfig from 'test/config';
import MockConfig from 'mock/config';
import MockCollections from 'mock/collection';
import fixCollections from 'test/fixtures/some-collections';
import MockSearch from 'mock/search';
import MockLastModified from 'mock/lastmodified';
import fixArticles from 'test/fixtures/articles';
import MockVisible from 'mock/stories-visible';
import verticalLayout from 'views/templates/vertical_layout.scala.html!text';
import mainLayout from 'views/templates/main.scala.html!text';
import Router from 'modules/router';
import handlers from 'modules/route-handlers';
import clone from 'utils/clean-clone';
import 'widgets/collection.html!text';
import 'widgets/trail.html!text';
import 'widgets/trail-editor.html!text';
import inject from 'test/utils/inject';
import fakePushState from 'test/utils/push-state';

export default class Loader {
    constructor() {
        var mockConfig, mockCollections, mockSearch, mockLastModified, mockVisibleStories;

        mockConfig = new MockConfig();
        mockConfig.set(testConfig.config);
        mockCollections = new MockCollections();
        mockCollections.set(fixCollections);
        mockSearch = new MockSearch();
        mockSearch.set(fixArticles.articlesData);
        mockSearch.latest(fixArticles.allArticles);
        mockLastModified = new MockLastModified();
        mockVisibleStories = new MockVisible();

        this.mockConfig = mockConfig;
        this.mockCollections = mockCollections;
        this.mockSearch = mockSearch;
        this.mockLastModified = mockLastModified;
        this.mockVisibleStories = mockVisibleStories;

        this.ko = inject(`
            ${verticalLayout}
            ${mainLayout}
        `);
        this.router = new Router(handlers, {
            pathname: '/test',
            search: '?layout=latest,front:uk'
        }, {
            pushState: (...args) => fakePushState.call(this.router.location, ...args)
        });
    }

    load(keepLocalStorage) {
        if (!keepLocalStorage) {
            localStorage.clear();
        }
        this.baseModule = this.router.load(clone(testConfig));
        this.ko.apply(this.baseModule);
        return this.baseModule.loaded;
    }

    dispose() {
        this.ko.dispose();
        this.mockConfig.dispose();
        this.mockCollections.dispose();
        this.mockSearch.dispose();
        this.mockLastModified.dispose();
        this.mockVisibleStories.dispose();
    }
}
