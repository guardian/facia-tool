import urlHost from './url-host';
import urlAbsPath from './url-abs-path';
import CONST from 'constants/defaults';

export default function(url) {

    var host = urlHost(url);

    if (host === CONST.viewerHost) {
      return url.match(/(preview|live)\/(.*[^#])/)[2];
    }

    return urlAbsPath(url);
};

