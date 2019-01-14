import capiQuery from './capiQuery';
import urls from 'constants/urls';
import pandaFetch from './pandaFetch';

export const liveCapi = capiQuery(urls.capiLiveUrl, pandaFetch);
export const previewCapi = capiQuery(urls.capiPreviewUrl, pandaFetch);
