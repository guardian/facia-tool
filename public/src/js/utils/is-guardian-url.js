import {CONST} from 'modules/vars';
import urlHost from 'utils/url-host';

export default function (url) {
    const host = urlHost(url);
    return host === CONST.mainDomain || host === CONST.mainDomainShort;
}
