import { request } from './authed-ajax';
import {CONST} from './vars';

export function recordUsage(mediaId, frontId) {
    const usageData = {
        mediaId: mediaId,
        front: frontId
    };

    return request({
        url: `${CONST.apiUsageBase}`,
        method: 'POST',
        data: JSON.stringify(usageData)
    });
}
