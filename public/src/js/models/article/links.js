import {CONST} from '../../modules/vars';
import urlAbsPath from '../../utils/url-abs-path';

export function getViewUrl(article) {
    var url;
    if (article.fields.isLive() === 'false') {
        url = CONST.previewBase + '/' + urlAbsPath(article.props.webUrl());
    } else {
        url = article.meta.href() || article.props.webUrl();

        if (url && !/^https?:\/\//.test(url)) {
            url = 'http://' + CONST.mainDomain + url;
        }
    }

    return url;
}

export function getOphanUrl(webUrl) {
    return CONST.ophanBase + '?path=/' + urlAbsPath(webUrl);
}
