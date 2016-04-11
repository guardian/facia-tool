import Extension from 'models/extension';
import fetchVisibleStories from 'utils/fetch-visible-stories';
import mediator from 'utils/mediator';

export default class extends Extension {

    constructor(baseModel) {
        super(baseModel);

        this.listenOn(mediator, 'ui:open', function (meta, article, front, collection) {
            setTimeout(() => this.refreshVisibleStories(true, collection), 50);
        });
        this.listenOn(mediator, 'ui:close', function (targetGroup, collection) {
            this.refreshVisibleStories(true, collection);
        });
        this.listenOn(mediator, 'collection:collapse', function(collection, collapsed) {
            if (!collapsed) {
                this.refreshVisibleStories(true, collection);
            }
        });
        this.listenOn(mediator, 'collection:populate', function(collection) {
            this.refreshVisibleStories(false, collection);
        });
    }

    refreshVisibleStories (stale, collection) {
        if (collection) {
            if (!collection.front.showIndicatorsEnabled()) {
                return collection.state.showIndicators(false);
            }
            if (!stale || !collection.visibleStories) {
                collection.visibleStories = fetchVisibleStories(
                    collection.configMeta.type(),
                    collection.groups
                );
            }
            collection.visibleStories.then(
                this.updateVisibleStories.bind(this, collection),
                this.updateVisibleStories.bind(this, collection, false)
            );
        }
    }

    updateVisibleStories (collection, numbers) {
        const container = collection.dom;
        if (!container || !numbers || collection.state.collapsed()) {
            collection.state.showIndicators(false);
            return;
        }

        collection.state.showIndicators(true);
        collection.state.visibleCount(numbers);
    }
}

