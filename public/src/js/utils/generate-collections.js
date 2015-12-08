import _ from 'underscore';
import * as vars from 'modules/vars';
import Collection from 'models/config/collection';
import cloneWithKey from './clone-with-key';

export default function generateCollections (collections) {
    var collectionDefinition = vars.model.state().config.collections;

    return _.chain(collections)
        .map(id => {
            if (collectionDefinition[id]) {
                return new Collection(cloneWithKey(collectionDefinition[id], id));
            }
        })
        .filter(collection => !!collection)
        .value();
}

