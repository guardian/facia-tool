import alert from 'test/utils/regions/alert';
import clipboard from 'test/utils/regions/clipboard';
import front from 'test/utils/regions/front';
import latest from 'test/utils/regions/latest';
import breakingNewsModal from 'test/utils/regions/breaking-news-modal';

export default function install () {
    return {
        latest,
        front,
        clipboard,
        alert,
        breakingNewsModal
    };
};
