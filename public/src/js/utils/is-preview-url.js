import {CONST} from '../modules/vars';
import urlHost from './url-host';

export default function (url) {
    return urlHost(url) === urlHost(CONST.previewBase);
}
