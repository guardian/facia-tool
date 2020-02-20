import find from 'lodash/find';
import sortBy from 'lodash/sortBy';
import urlConstants from '../../constants/url';
import deepGet from 'lodash/get';
import grid, { recordUsage } from './grid';
import fetchImage from './fetchImage';
import { Crop, Criteria } from 'shared/types/Grid';
import { DRAG_DATA_GRID_IMAGE_URL } from 'constants/image';

interface ImageDescription {
  height?: number;
  width?: number;
  thumb?: string;
  origin?: string;
  ratio?: number;
  path: string;
  criteria?: Criteria;
}

interface ValidationResponse {
  src: string;
  thumb: string;
  origin: string;
  height: number;
  width: number;
}

function filterGridCrops(
  json: string,
  desired: { crop: string },
  { minWidth, maxWidth, widthAspectRatio, heightAspectRatio }: Criteria = {}
) {
  return grid.gridInstance.filterCrops(json, (crop: Crop) => {
    if (desired.crop && crop.id !== desired.crop) {
      return false;
    }

    const ratio =
      widthAspectRatio && heightAspectRatio
        ? widthAspectRatio / heightAspectRatio
        : NaN;

    return !!find([crop.master].concat(crop.assets).filter(Boolean), asset => {
      const { width, height } = asset.dimensions;
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

function getSuitableImageDetails(
  crops: Crop[],
  id: string,
  desired: Criteria
): Promise<ImageDescription> {
  if (crops.length === 0) {
    return Promise.reject(
      new Error('The image does not have a valid crop on the Grid')
    );
  }
  const { maxWidth, minWidth } = desired;
  const assets = sortBy(
    [crops[0].master]
      .concat(crops[0].assets)
      .filter(Boolean)
      .filter(asset =>
        maxWidth
          ? parseInt(`${deepGet(asset, ['dimensions', 'width'])}`, 10) <=
            maxWidth
          : true
      )
      .filter(asset =>
        minWidth
          ? parseInt(`${deepGet(asset, ['dimensions', 'width'])}`, 10) >=
            minWidth
          : true
      ),
    asset => parseInt(`${deepGet(asset, ['dimensions', 'width'])}`, 10) * -1
  );

  if (assets.length) {
    const mainImageDetails = assets[0];
    const path = mainImageDetails.secureUrl;
    const { height, width } = mainImageDetails.dimensions;
    return Promise.resolve({
      path,
      thumb: assets[assets.length - 1].secureUrl,
      origin: `${urlConstants.media.mediaBaseUrl}/image/${id}`,
      height,
      width,
      ratio: width / height
    });
  }
  return Promise.reject(
    new Error('The crop does not have a valid asset on the Grid')
  );
}

function validateActualImage(image: ImageDescription, frontId?: string) {
  return new Promise<any>((resolve, reject) => {
    const {
      width = 0,
      height = 0,
      ratio = 0,
      criteria,
      path,
      origin,
      thumb
    } = image;
    const {
      maxWidth,
      minWidth,
      widthAspectRatio,
      heightAspectRatio
    }: Criteria = criteria || {};
    const criteriaRatio =
      widthAspectRatio && heightAspectRatio
        ? widthAspectRatio / heightAspectRatio
        : NaN;

    if (maxWidth && maxWidth < width) {
      return reject(
        new Error(`Images cannot be more than ${maxWidth} pixels wide`)
      );
    } else if (minWidth && minWidth > width) {
      return reject(
        new Error(`Images cannot be less than ${minWidth} pixels wide`)
      );
    } else if (criteriaRatio && criteriaRatio - ratio > 0.01) {
      return reject(
        new Error(
          `Images must have a ${widthAspectRatio || ''}:${heightAspectRatio ||
            ''} aspect ratio`
        )
      );
    }
    if (image.origin) {
      return recordUsage(image.origin.split('/').slice(-1)[0], frontId).then(
        () => {
          resolve({ path, origin, thumb, width, height });
        }
      );
    }
    return resolve({ path, origin, thumb, width, height });
  });
}

function stripImplementationDetails(
  src: string,
  criteria?: Criteria
): Promise<ImageDescription> {
  return new Promise((resolve, reject) => {
    const maybeFromGrid = grid.gridInstance.excractMediaId(src);
    if (src && urlConstants.media.imgIXDomainExpr.test(src)) {
      const localSource = src
        .substring(0, src.indexOf('?'))
        .replace(
          urlConstants.media.imgIXDomainExpr,
          urlConstants.media.staticImageCdnDomain
        );
      resolve({
        path: localSource,
        criteria
      });
    } else if (maybeFromGrid) {
      grid.gridInstance
        .getImage(maybeFromGrid.id)
        .catch((e: Error) =>
          reject(
            new Error(`There was a problem contacting The Grid - ${e.message}`)
          )
        )
        .then((gridImageJson: string) =>
          filterGridCrops(gridImageJson, maybeFromGrid, criteria)
        )
        .then((crops: Crop[]) =>
          getSuitableImageDetails(crops, maybeFromGrid.id, criteria || {})
        )
        .then((asset: ImageDescription) =>
          resolve({
            ...asset,
            criteria
          })
        )
        .catch(reject);
    } else if (!urlConstants.media.imageCdnDomainExpr.test(src)) {
      reject(
        new Error(
          `Images must come from ${
            urlConstants.media.imageCdnDomain
          } or the Grid`
        )
      );
    } else {
      resolve({
        path: src,
        criteria
      });
    }
  });
}

/**
 * Asserts if the given image URL is on The Guardian domain, is proper size and aspect ratio.
 * @param {string} src image source
 * @param criteria. validation criteria object. defines: maxWidth, minWidth, widthAspectRatio, heightAspectRatio
 * @returns Promise object: rejects with (error) OR resolves with (width, height, src)
 */
function validateImageSrc(
  src: string,
  frontId?: string,
  criteria?: Criteria
): Promise<ValidationResponse> {
  if (!src) {
    return Promise.reject(new Error('Missing image'));
  }

  return stripImplementationDetails(src, criteria)
    .then(fetchImage)
    .then(image => validateActualImage(image, frontId))
    .then(({ path, origin, thumb, width, height }) => ({
      src: path,
      origin: origin || path,
      thumb: thumb || path,
      width,
      height
    }));
}

function getData(
  event: DragEvent | React.DragEvent<HTMLElement>,
  identifier: string
) {
  const dataTransfer = (event as React.DragEvent<HTMLElement>).nativeEvent
    ? (event as React.DragEvent<HTMLElement>).nativeEvent.dataTransfer
    : event.dataTransfer;
  return dataTransfer && dataTransfer.getData
    ? dataTransfer.getData(identifier)
    : null;
}

function validateMediaItem(
  crop: Crop,
  imageOrigin: string,
  frontId: string,
  criteria?: Criteria
): Promise<ValidationResponse> {
  return getSuitableImageDetails([crop], crop.id, criteria || {})
    .then(asset => {
      const newImageDetails = asset;
      newImageDetails.criteria = criteria;
      newImageDetails.origin = imageOrigin;
      return newImageDetails;
    })
    .then(img => validateActualImage(img, frontId))
    .then(({ path, origin, thumb, width, height }) => ({
      src: path,
      origin: origin || path,
      thumb: thumb || path,
      width,
      height
    }));
}

function validateImageEvent(
  event: DragEvent | React.DragEvent<HTMLElement>,
  frontId: string,
  criteria?: Criteria
): Promise<ValidationResponse> {
  const mediaItem = grid.gridInstance.getCropFromEvent(event);
  const imageOrigin = grid.gridInstance.getGridUrlFromEvent(event);

  if (mediaItem) {
    return validateMediaItem(mediaItem, imageOrigin, frontId, criteria);
  }
  const url =
    grid.gridInstance.getGridUrlFromEvent(event) ||
    getData(event, 'url') ||
    getData(event, DRAG_DATA_GRID_IMAGE_URL);

  if (url) {
    return validateImageSrc(url, frontId, criteria);
  }
  return Promise.reject(
    new Error('Invalid image source, are you dragging from the grid?')
  );
}

export {
  ImageDescription,
  ValidationResponse,
  validateImageSrc,
  validateImageEvent,
  validateMediaItem
};
