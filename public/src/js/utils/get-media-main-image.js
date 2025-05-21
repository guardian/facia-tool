import _ from 'underscore';
import deepGet from 'utils/deep-get';
import * as vars from 'modules/vars';

export default function (contentApiArticle) {
    const mainBodyHtml = deepGet(contentApiArticle, '.blocks.main.bodyHtml');
    const mainImage = _.find(
        deepGet(contentApiArticle, '.blocks.main.elements') || [],
        element => element.type === 'image'
    );
    if (mainImage && mainBodyHtml) {
        let fileAsset = _.find(mainImage.assets, asset => {
            // This is ugly, CAPI doesn't have a field for the image, it's inside the
            // bodyHtml, try to understand which image to use
            return mainBodyHtml.indexOf(asset.secureUrl) !== -1;
        });
        if (!fileAsset) {
            // Couldn't match in bodyHtml, pick the first asset
            fileAsset = mainImage.assets[0];
        }

        if (fileAsset) {
            const mediaId = deepGet(mainImage, '.imageTypeData.mediaId');
            let origin;
            if (mediaId && deepGet(mainImage, '.imageTypeData.mediaApiUri')) {
                origin = vars.model.state().defaults.baseUrls.mediaBaseUrl + '/images/' + mediaId;
            }
            return {
                href: fileAsset.secureUrl,
                origin: origin
            };
        }
    }
}
