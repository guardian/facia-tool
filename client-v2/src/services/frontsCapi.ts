import capiQuery from "./capiQuery";
import urls from "constants/urls";

export const liveCapi = capiQuery(urls.capiLiveUrl);
export const previewCapi = capiQuery(urls.capiPreviewUrl);
