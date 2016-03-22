import * as vars from 'modules/vars';
import deepGet from 'utils/deep-get';

class TagManager {
    getTags() {
        const metadata = deepGet(vars.model.state(), '.defaults.collectionMetadata') || [];
        return Promise.resolve(metadata.map(tag => tag.type));
    }
}

export default new TagManager();
