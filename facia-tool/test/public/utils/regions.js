import alert from 'test/utils/regions/alert';
import latest from 'test/utils/regions/latest';
import front from 'test/utils/regions/front';
import clipboard from 'test/utils/regions/clipboard';

export default function install () {
    return {
        latest,
        front,
        clipboard,
        alert
    };
};
