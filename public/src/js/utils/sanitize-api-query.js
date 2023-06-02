import _ from 'underscore';
import parseQueryParams from '../utils/parse-query-params';

export default function (url) {
    const bits = (url + '').split('?');

    if (bits.length <= 1) {
        return url;
    }

    const params = _.map(
        parseQueryParams(url, {
            predicateKey: key => key !== 'api-key',
            predicateVal: val => val
        }),
        (val, key) => key + '=' + val
    ).join('&');

    return bits[0].replace(/^\/+/, '') + (params ? '?' + params : '');
}
