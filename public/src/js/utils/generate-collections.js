import _ from 'underscore';
import * as vars from '../modules/vars';
import Collection from '../models/config/collection';
import cloneWithKey from '../utils/clone-with-key';

export default function generateCollections (collections) {
    var collectionDefinition = vars.model.state().config.collections;

    return _.chain(collections)
        .map(id => {
            const collection = collectionDefinition[id];
            return collection ? new Collection(cloneWithKey(collection, id)) : null;
        })
        .filter(collection => !!collection)
        .value();
}
