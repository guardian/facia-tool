var a = document.createElement('a');

/*
 * @param {string} url
 * @param {bool} keepQueryString
 * @description gets the absolute path, keepQueryString was added where campaign
 * params where being removed. Because this helper is many other places keeping
 * queryStrings is opt in
 */
export default function(url, keepQueryString) {
    if (typeof url === 'string') {
        // If necessary, add a leading slash to stop the browser resolving it against the current path
        url = url.match(/^\//) || url.match(/^https?:\/\//) ? url : '/' + url;

        a.href = url;

        var path = a.pathname.replace(/^\//, '');

        // Return the abspath without a leading slash, because ContentApi ids are formed like that
        return keepQueryString ? path + a.search : path;
    }
}
