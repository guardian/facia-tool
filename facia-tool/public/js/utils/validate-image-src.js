import Promise from 'Promise';
import _ from 'underscore';
import GridUtil from 'grid-util-js';
import * as vars from 'modules/vars';
import deepGet from 'utils/deep-get';

/**
 * Asserts if the given image URL is on The Guardian domain, is proper size and aspect ratio.
 * @param src image source
 * @param criteria. validation criteria object. defines: maxWidth, minWidth, widthAspectRatio, heightAspectRatio
 * @returns Promise object: rejects with (error) OR resolves with (width, height, src)
 */
function validateImageSrc(src, criteria = {}) {
    if (!src) {
        return Promise.reject(new Error('Missing image'));
    }

    return stripImplementationDetails(src, criteria)
        .then(fetchImage)
        .then(validateActualImage)
        .then(({path, origin, thumb, width, height}) => {
            return {
                src: path,
                origin: origin || path,
                thumb: thumb || path,
                width, height
            };
        });
}

function grid() {
    if (!validateImageSrc.gridInstance) {
        validateImageSrc.gridInstance = new GridUtil({
            apiBaseUrl: vars.model.state().defaults.apiBaseUrl,
            fetchInit: {
                credentials: 'include',
                mode: 'cors'
            }
        });
    }
    return validateImageSrc.gridInstance;
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

        let ratio = widthAspectRatio && heightAspectRatio ? widthAspectRatio / heightAspectRatio : NaN;
        return !!_.find(crop.assets, function (asset) {
            let {width, height} = asset.dimensions;
            let actualRatio = width / height;
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
        let maxWidth = desired.maxWidth || 1000;
        let assets = _.chain(crops[0].assets)
            .filter(asset => deepGet(asset, '.dimensions.width') <= maxWidth)
            .sortBy(asset => deepGet(asset, '.dimensions.width') * -1);
        let path = assets.first().value().file;

        return {
            path: path,
            thumb: assets.last().value().file,
            origin: vars.model.state().defaults.mediaBaseUrl + '/image/' + id
        };
    }
}

function validateActualImage (image) {
    return new Promise((resolve, reject) => {
        let {width, height, ratio, criteria, path, origin, thumb} = image;
        let {maxWidth, minWidth, widthAspectRatio, heightAspectRatio} = criteria;
        let criteriaRatio = widthAspectRatio && heightAspectRatio ? widthAspectRatio / heightAspectRatio : NaN;

        if (maxWidth && maxWidth < width) {
            reject(new Error('Images cannot be more than ' + maxWidth + ' pixels wide'));
        } else if (minWidth && minWidth > width) {
            reject(new Error('Images cannot be less than ' + minWidth + ' pixels wide'));
        } else if (criteriaRatio && criteriaRatio - ratio > 0.01) {
            reject(new Error('Images must have a ' + widthAspectRatio + ':' + heightAspectRatio + ' aspect ratio'));
        } else {
            resolve({
                path, origin, thumb, width, height
            });
        }
    });
}

export default validateImageSrc;
