import Router from 'modules/router';
import handlers from 'modules/route-handlers';
import clone from 'utils/clean-clone';

import verticalLayout from 'views/templates/vertical_layout.scala.html!text';
import mainLayout from 'views/templates/main.scala.html!text';

import defaultCollectionsConfig from 'test/config';
import defaultCollections from 'test/fixtures/some-collections';
import defaultArticles from 'test/fixtures/articles';
import installActions from 'test/utils/actions';
import installRegions from 'test/utils/regions';
import inject from 'test/utils/inject';
import fakePushState from 'test/utils/push-state';
import installMocks from 'test/utils/mocks';
import * as wait from 'test/utils/wait';

export default class Page {
    constructor(url, {
        testConfig = defaultCollectionsConfig,
        fixCollections = defaultCollections,
        fixArticles = defaultArticles
    } = {}, done) {
        this.testConfig = testConfig;
        this.routerParams = extractRouterParamsFromUrl(url);

        this.mocks = installMocks({testConfig, fixCollections, fixArticles});
        this.actions = installActions(this);
        this.regions = installRegions(this);

        this.loaded = this.apply()
        .then(() => done())
        .catch(done.fail);
    }

    apply() {
        this.ko = inject(`
            ${verticalLayout}
            ${mainLayout}
        `);
        this.router = new Router(handlers, this.routerParams, {
            pushState: (...args) => fakePushState.call(this.router.location, ...args)
        });

        this.baseModule = this.router.load(clone(this.testConfig));
        return Promise.all([
            this.ko.apply(this.baseModule),
            this.baseModule.loaded
        ])
        .then(() => wait.ms(10));
    }

    reload() {
        // Reload is like disposing but without clearing the local storage
        return this.loaded.then(() => {
            this.ko.dispose();
            this.loaded = this.apply();
            return this.loaded;
        });
    }

    dispose(done) {
        this.loaded
        .then(() => this.mocks.dispose())
        .then(() => {
            this.ko.dispose();
            localStorage.clear();
        })
        .then(() => done())
        .catch(done.fail);
    }
}

function extractRouterParamsFromUrl(url = '') {
    var path = url.split('?');
    return {
        pathname: path[0],
        search: path[1] ? ('?' + path[1]) : ''
    };
}
