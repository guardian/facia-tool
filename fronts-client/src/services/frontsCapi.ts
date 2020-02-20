import capiQuery from './capiQuery';
import url from 'constants/url';

export const liveCapi = capiQuery(url.capiLiveUrl);
export const previewCapi = capiQuery(url.capiPreviewUrl);
