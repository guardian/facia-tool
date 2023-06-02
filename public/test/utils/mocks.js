import MockConfig from 'mock/config';
import MockCollections from 'mock/collection';
import MockSearch from 'mock/search';
import MockLastModified from 'mock/lastmodified';
import MockVisible from 'mock/stories-visible';
import * as ajax from './modules/authed-ajax';

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

    spyOn(ajax, 'request').and.callThrough();

    return Object.assign(all, {
        dispose() {
            Object.keys(all).filter(name => name.indexOf('mock') === 0)
                .forEach(name => all[name].dispose());

            return Promise.all(
                ajax.request.calls.all().map(
                    call => call.returnValue.catch(() => {})
                ));
        }
    });
}
