import {request} from 'modules/authed-ajax';
import {model, CONST} from 'modules/vars';
import humanTime from 'utils/human-time';

function getFrontAgeAlertMs(front) {

    const defaultAlertAge = 600000;

    if (!model) {
      return defaultAlertAge;
    }

    return CONST.frontAgeAlertMs[
        CONST.highFrequencyPaths.indexOf(front) > -1 ? 'front' : model.fullPriority
    ] || defaultAlertAge;
}

export default function(front) {
    // The server does not respond with JSON
    function parseResponse (resp) {
        if (resp.status === 200 && resp.responseText) {
            var date = new Date(resp.responseText);

            return {
                date: date,
                human: humanTime(date),
                stale: new Date() - date > getFrontAgeAlertMs(front)
            };
        } else {
            return {};
        }
    }

    return request({
        url: '/front/lastmodified/' + front
    })
    .then(parseResponse, parseResponse);
}
