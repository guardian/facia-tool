import urlAbsPath from 'utils/url-abs-path';
import campaignCodeParams from 'constants/campaign-code-params';
import _ from 'underscore';

export default function(url) {
    const queryParameters = url.split('?')[1];

    let campaignCodes;
    if (queryParameters) {
        const paramsList = queryParameters.split('&');
        campaignCodes = _.reduce(paramsList, (campaignCodes, queryParam) => {
            const paramName = queryParam.split('=')[0];
            if  (campaignCodeParams.indexOf(paramName) !== -1) {
                campaignCodes += queryParam + '&';
            }
            return campaignCodes;
        }, '?');
    } else {
        campaignCodes = '';
    }

    //If there were query parameters, there is either an extra '?' or '&'
    //appended to the end of the campaign codes string
    const trimmedCodes = campaignCodes.substring(0, campaignCodes.length - 1);

    return urlAbsPath(url) + trimmedCodes;
}
