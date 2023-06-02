import * as authedAjax from '../../modules/authed-ajax';
import serializeArticleMeta from '../../utils/serialize-article-meta';

class Persistence {
    constructor() {
        this.article = {
            save: (article) => {
                const parentType = article.group.parent ? article.group.parentType : null;

                if (parentType === 'Article') {
                    return article.group.parent.save();
                } else if (parentType === 'Collection') {
                    return updateCollection(article, article.group.parent);
                } else {
                    return Promise.resolve(false);
                }
            }
        };
    }
}

function updateCollection(article, collection) {
    collection.setPending(true);

    return authedAjax.updateCollections({
        update: {
            collection: collection,
            item:       article.id(),
            position:   article.id(),
            itemMeta:   serializeArticleMeta(article),
            mode:       article.front.mode()
        }
    });
}

const persistenceInterface = new Persistence();

export default persistenceInterface;
