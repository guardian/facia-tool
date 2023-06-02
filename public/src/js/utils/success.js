import modalDialog from '../modules/modal-dialog';
import {CONST} from '../modules/vars';

export default function (request) {
    modalDialog.confirm({
        name: 'success_alert',
        data: {
            trails: request.trails.map(trail => {
                return {
                    href: CONST.ophanTrailBase + '/' + trail.path,
                    message: trail.headline
                };
            })
        }
    });
}
