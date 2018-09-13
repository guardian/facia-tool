// @flow

import type { Description, Asset } from './validateImageSrc';

function fetchImage(description: Description): Promise<Asset> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => {
      reject(new Error('That image could not be found'));
    };
    img.onload = () => {
      const size = {
        width: img.width,
        height: img.height,
        ratio: img.width / img.height
      };
      const asset: Asset = {
        ...description,
        ...size
      };
      resolve(asset);
    };
    img.src = description.path;
  });
}

export default fetchImage;
