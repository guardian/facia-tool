import _ from 'underscore';
import deepGet from '../utils/deep-get';
import parseQueryParams from '../utils/parse-query-params';
import grid from '../utils/grid';

function getMediaItem(dataTransfer) {
    var mediaItem = grid().getCropFromEvent({dataTransfer});

    if (mediaItem) {
        const id = mediaItem.id;
        mediaItem = _.chain(mediaItem.assets)
            .filter(function(asset) { return deepGet(asset, '.dimensions.width') <= 1000; })
            .sortBy(function(asset) { return deepGet(asset, '.dimensions.width') * -1; })
            .first()
            .value();

        if (mediaItem) {
            mediaItem.origin = grid().getGridUrlFromEvent({dataTransfer});
            mediaItem.crop = id;
            mediaItem.dataTransfer = dataTransfer;
        }

        if (!mediaItem) {
            throw new Error('Sorry, a suitable crop size does not exist for this image');
        }

    } else if (dataTransfer && dataTransfer.getData) {
        var url = dataTransfer.getData('Url');
        if (url && grid().excractMediaId(url)) {
            mediaItem = {
                dataTransfer: dataTransfer,
                origin: url
            };
        }
    }
    return mediaItem;
}

function getItem(dataTransfer, sourceGroup) {
    var id = dataTransfer.getData('Text'),
        mediaItem = getMediaItem(dataTransfer),
        sourceItem = dataTransfer.getData('sourceItem'),
        knownQueryParams = parseQueryParams(id, {
            namespace: 'gu-',
            excludeNamespace: false,
            stripNamespace: true
        }),
        unknownQueryParams = parseQueryParams(id, {
            namespace: 'gu-',
            excludeNamespace: true
        });

    if (!mediaItem && !id) {
        throw new Error('Sorry, you can\'t add that to a front');
    }

    if (sourceItem) {
        sourceItem = JSON.parse(sourceItem);
        sourceItem.front = (sourceGroup || {}).front;

    } else if (unknownQueryParams.url) {
        sourceItem = { id: unknownQueryParams.url };
        sourceGroup = undefined;

    } else {
        sourceItem = {
            id: id.split('?')[0] + (_.isEmpty(unknownQueryParams) ? '' : '?' + _.map(unknownQueryParams, function(val, key) {
                return key + (val ? '=' + encodeURIComponent(val) : '');
            }).join('&')),
            meta: knownQueryParams
        };
        sourceGroup = undefined;
    }

    return {
        mediaItem: mediaItem,
        sourceItem: sourceItem,
        sourceGroup: sourceGroup
    };
}

export {
    getMediaItem,
    getItem
};
