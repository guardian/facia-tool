import * as authedAjax from 'modules/authed-ajax';
import isGuardianUrl from 'utils/is-guardian-url';
import urlHost from 'utils/url-host';

export default function (url) {
    const isOnSite = isGuardianUrl(url);

    return authedAjax.request({
        url: '/http/proxy/' + url + (isOnSite ? '?view=mobile' : ''),
        type: 'GET'
    })
    .then(response => {
        const doc = document.createElement('div');
        doc.innerHTML = response;

        const graph = {};
        Array.prototype.forEach.call(doc.querySelectorAll('meta[property^="og:"]'), tag => {
            graph[tag.getAttribute('property').replace(/^og:/, '')] = tag.getAttribute('content');
        });

        const titleTag = doc.querySelector('title');
        const title = titleTag ? titleTag.innerHTML.trim() : undefined;

        const map = {
            title: graph.title || title
        };
        if (graph.description) {
            map.description = graph.description;
        }
        if (!isOnSite) {
            map.siteName = graph.site_name || urlHost(url).replace(/^www\./, '');
        }

        return map;
    })
    .catch(ex => {
        throw new Error(`Unable to fetch ${url} \n ${ex.statusText || ex.message}`);
    });
}
