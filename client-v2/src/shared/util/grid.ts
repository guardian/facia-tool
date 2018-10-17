import GridUtil from 'grid-util-js';
import imageConstants from '../constants/images';

class Grid {
  public instance = new GridUtil({
    apiBaseUrl: imageConstants.apiBaseUrl,
    fetchInit: {
      credentials: 'include',
      mode: 'cors'
    }
  });

  get gridInstance() {
    return this.instance;
  }

  public setGridInstance(instance: typeof GridUtil) {
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
    body: JSON.stringify(usageData)
  });
}

export default grid;
