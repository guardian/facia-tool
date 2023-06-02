import ko from 'knockout';
import _ from 'underscore';
import LatestArticles from '../../models/collections/latest-articles';
import ColumnWidget from '../column-widget';

class Latest extends ColumnWidget {
    constructor(params, element) {
        super(params, element);

        this.showingDrafts = ko.observable(false);

        let resolveLatestLoaded;
        this.loaded = new Promise(resolve => resolveLatestLoaded = resolve);
        this.latestArticles = new LatestArticles({
            container: element,
            showingDrafts: this.showingDrafts,
            callback: _.once(() => resolveLatestLoaded(this))
        });

        this.latestArticles.search();
        this.latestArticles.startPoller();

        this.subscribeOn(this.baseModel.switches, switches => {
            if (this.showingDrafts() && !switches['facia-tool-draft-content']) {
                this.showLive();
            }
        });
    }

    showDrafts() {
        this.showingDrafts(true);
        this.latestArticles.search();
    }

    showLive() {
        this.showingDrafts(false);
        this.latestArticles.search();
    }

    dispose() {
        super.dispose();
        this.latestArticles.dispose();
    }
}

export default Latest;
