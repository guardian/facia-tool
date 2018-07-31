import { request } from 'modules/authed-ajax';
import {CONST} from 'modules/vars';

export function recordUsage(mediaId, frontId) {
    const usageData = {
        mediaId: mediaId,
        containerId: frontId,
        usageStatus: 'front_usage',
        usageId: 'frontId'
    };

    return request({
        url: `${CONST.apiUsageBase}`,
        method: 'POST',
        data: JSON.stringify(usageData)
    });
}
