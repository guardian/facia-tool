import MockConfig from 'mock/config';
import MockCollections from 'mock/collection';
import MockSearch from 'mock/search';
import MockLastModified from 'mock/lastmodified';
import MockVisible from 'mock/stories-visible';

export default function install ({
    testConfig = {},
    fixCollections = {},
    fixArticles = {}
} = {}) {
    var all = {
        mockConfig: new MockConfig(),
        mockCollections: new MockCollections(),
        mockSearch: new MockSearch(),
        mockLastModified: new MockLastModified(),
        mockVisibleStories: new MockVisible()
    };

    all.mockConfig.set(testConfig.config);
    all.mockCollections.set(fixCollections);
    all.mockSearch.set(fixArticles.articlesData);
    all.mockSearch.latest(fixArticles.allArticles);

    return Object.assign(all, {
        dispose() {
            Object.keys(all).filter(name => name.indexOf('mock') === 0)
                .forEach(name => all[name].dispose());
        }
    });
}
