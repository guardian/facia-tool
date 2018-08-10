import { request } from 'modules/authed-ajax';
import {CONST} from 'modules/vars';

export function recordUsage(mediaId, frontId) {
    const usageData = {
        mediaId: mediaId,
        front: frontId,
    };

    return request({
        url: `${CONST.apiUsageBase}`,
        method: 'POST',
        data: JSON.stringify(usageData)
    });
}
