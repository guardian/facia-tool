import CONST from '../constants/defaults';
import urlHost from '../utils/url-host';
import urlAbsPath from '../utils/url-abs-path';

export default function(url) {

    var host = urlHost(url);

    if (host === CONST.viewerHost) {
      return url.match(/(preview|live)\/(.*[^#])/)[2];
    }

    return urlAbsPath(url);
}
