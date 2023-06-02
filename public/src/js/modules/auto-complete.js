import {request} from './authed-ajax';
import * as cache from './cache';
import {CONST} from './vars';

const maxItems = 50;

export default function ({
        query = '',
        path = 'tags',
        page = 1
    } = {}) {

    return new Promise((resolve, reject) => {
        if (!query) {
            return resolve();
        } else if (!query.match(/[a-z0-9]+/i)) {
            return reject(new Error('Invalid search term'));
        }

        const url = '/' + path + '?' + [
            'q=' + query,
            'page-size=' + maxItems,
            'page=' + page
        ].join('&');
        const cached = cache.get('contentApi', url);

        if (cached) {
            resolve(cached);
        } else {
            request({
                url: CONST.apiSearchBase + url
            })
            .then(({response} = {}) => {
                if (!response || !response.results) {
                    reject(new Error('No results from CAPI'));
                } else {
                    cache.put('contentApi', url, response);
                    resolve(response);
                }
            }, () => {
                reject(new Error('Error getting results from CAPI'));
            });
        }
    });
}
