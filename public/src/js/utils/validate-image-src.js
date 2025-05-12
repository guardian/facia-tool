import _ from 'underscore';
import * as vars from 'modules/vars';
import deepGet from 'utils/deep-get';
import grid from 'utils/grid';
import { recordUsage } from 'modules/grid';

/**
 * Asserts if the given image URL is on The Guardian domain, is proper size and aspect ratio.
 * @param src image source
 * @param criteria. validation criteria object. defines: maxWidth, minWidth, widthAspectRatio, heightAspectRatio
 * @returns Promise object: rejects with (error) OR resolves with (width, height, src)
 */
function validateImageSrc(src, frontId, criteria = {}) {
    if (!src) {
        return Promise.reject(new Error('Missing image'));
    }

    return stripImplementationDetails(src, criteria)
        .then(fetchImage)
        .then((image) => validateActualImage(image, frontId))
        .then(({path, origin, thumb, width, height}) => {
            return {
                src: path,
                origin: origin || path,
                thumb: thumb || path,
                width, height
            };
        });
}

function stripImplementationDetails (src, criteria) {
    return new Promise((resolve, reject) => {
        var maybeFromGrid = grid().excractMediaId(src);

        if (src && vars.CONST.imgIXDomainExpr.test(src)) {
            src = src.substring(0, src.indexOf('?')).replace(vars.CONST.imgIXDomainExpr, vars.CONST.staticImageCdnDomain);
            resolve({
                path: src,
                criteria
            });
        } else if (maybeFromGrid) {
            grid().getImage(maybeFromGrid.id)
                .catch(() => reject(new Error('Unable to locate the image on the Grid')))
                .then(gridImageJson => filterGripdCrops(gridImageJson, maybeFromGrid, criteria))
                .then(crops => getSuitableAsset(crops, maybeFromGrid.id, criteria))
                .then(asset => resolve(_.extend(asset, {criteria})))
                .catch(reject);
        } else if (!vars.CONST.imageCdnDomainExpr.test(src)) {
            reject(new Error('Images must come from ' + vars.CONST.imageCdnDomain + ' or the Grid'));
        } else {
            resolve({
                path: src,
                criteria
            });
        }
    });
}

function fetchImage (description) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.onerror = function() {
            reject(new Error('That image could not be found'));
        };
        img.onload = function() {
            let size = {
                width: this.width,
                height: this.height,
                ratio: this.width / this.height
            };
            resolve(_.extend(description, size));
        };
        img.src = description.path;
    });
}

function filterGripdCrops (json, desired, {minWidth, maxWidth, widthAspectRatio, heightAspectRatio}) {
    return grid().filterCrops(json, function (crop) {
        if (desired.crop && crop.id !== desired.crop) {
            return false;
        }

        const ratio = widthAspectRatio && heightAspectRatio ? widthAspectRatio / heightAspectRatio : NaN;

        return !!_.find([crop.master].concat(crop.assets).filter(Boolean), function (asset) {
            const {width, height} = asset.dimensions;
            const actualRatio = width / height;
            if (maxWidth && maxWidth < width) {
                return false;
            } else if (minWidth && minWidth > width) {
                return false;
            } else if (ratio && Math.abs(ratio - actualRatio) > 0.01) {
                return false;
            }
            return true;
        });
    });
}

function getSuitableAsset (crops, id, desired) {
    if (crops.length === 0) {
        return Promise.reject(new Error('The image does not have a valid crop on the Grid'));
    } else {
        const maxWidth = desired.maxWidth;
        const minWidth = desired.minWidth;
        const assets = _.chain([crops[0].master].concat(crops[0].assets))
            .filter(Boolean)
            .filter(asset => maxWidth ? deepGet(asset, '.dimensions.width') <= maxWidth : true)
            .filter(asset => minWidth ? deepGet(asset, '.dimensions.width') >= minWidth : true)
            .sortBy(asset => deepGet(asset, '.dimensions.width') * -1);

        if (assets.value().length) {
            const mainAsset = assets.first().value();
            const path = mainAsset.secureUrl;
            const height = mainAsset.dimensions.height;
            const width = mainAsset.dimensions.width;

            return Promise.resolve({
                path: path,
                thumb: assets.last().value().secureUrl,
                origin: vars.model.state().defaults.baseUrls.mediaBaseUrl + '/image/' + id,
                height: height,
                width: width,
                ratio: width / height
            });
        } else {
            return Promise.reject(new Error('The crop does not have a valid asset on the Grid'));
        }
    }
}

function validateActualImage (image, frontId) {
    return new Promise((resolve, reject) => {
        const {width, height, ratio, criteria, path, origin, thumb} = image;
        const {maxWidth, minWidth, widthAspectRatio, heightAspectRatio} = criteria;
        const criteriaRatio = widthAspectRatio && heightAspectRatio ? widthAspectRatio / heightAspectRatio : NaN;

        if (maxWidth && maxWidth < width) {
            reject(new Error('Images cannot be more than ' + maxWidth + ' pixels wide'));
        } else if (minWidth && minWidth > width) {
            reject(new Error('Images cannot be less than ' + minWidth + ' pixels wide'));
        } else if (criteriaRatio && criteriaRatio - ratio > 0.01) {
            reject(new Error('Images must have a ' + widthAspectRatio + ':' + heightAspectRatio + ' aspect ratio'));
        } else {
            const resolveWithImage = () => resolve({ path, origin, thumb, width, height });
            if (image.origin) {
                return recordUsage(image.origin.split('/').slice(-1)[0], frontId)
                .then(resolveWithImage())
                .catch(resolveWithImage());
            }
            resolve(resolveWithImage());
        }
    });
}

function validateImageEvent (event, frontId, criteria = {}) {
    let mediaItem = grid().getCropFromEvent(event);

    if (mediaItem) {
        return getSuitableAsset([{
            assets: mediaItem.assets,
            master: mediaItem.master
        }], mediaItem.id, criteria).then(asset => {
            asset.origin = grid().getGridUrlFromEvent(event);
            asset.criteria = criteria;
            return asset;
        })
        .then(image => validateActualImage(image, frontId))
        .then(({path, origin, thumb, width, height}) => {
            return {
                src: path,
                origin: origin || path,
                thumb: thumb || path,
                width, height
            };
        });
    } else {
        let url = grid().getGridUrlFromEvent(event) || getData(event, 'Url');

        if (url) {
            return validateImageSrc(url, frontId, criteria);
        } else {
            return Promise.reject(new Error('Invalid image source, are you dragging from the grid?'));
        }
    }
}

function getData(event, identifier) {
    var dataTransfer = event.nativeEvent ? event.nativeEvent.dataTransfer : event.dataTransfer;
    if (dataTransfer && dataTransfer.getData) {
        return dataTransfer.getData(identifier);
    }
}

export {validateImageSrc, validateImageEvent};
