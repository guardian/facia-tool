// @flow

import GridUtil from 'grid-util-js';
import imageConstants from '../constants/images';

class Grid {
  instance = new GridUtil({
    apiBaseUrl: imageConstants.apiBaseUrl,
    fetchInit: {
      credentials: 'include',
      mode: 'cors'
    }
  });

  get gridInstance() {
    return this.instance;
  }

  setGridInstance(instance: GridUtil) {
    this.instance = instance;
  }
}

const grid = new Grid();

export function recordUsage(mediaId: string, frontId?: string) {
  const usageData = {
    mediaId,
    front: frontId
  };

  return fetch(imageConstants.usageBaseUrl, {
    method: 'POST',
    data: JSON.stringify(usageData)
  });
}

export default grid;
