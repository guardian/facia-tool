import * as vars from 'modules/vars';
import GridUtil from 'grid-util-js';

export default function grid() {
    if (!grid.gridInstance) {
        grid.gridInstance = new GridUtil({
            apiBaseUrl: vars.model.state().defaults.baseUrls.apiBaseUrl,
            fetchInit: {
                credentials: 'include',
                mode: 'cors'
            }
        });
    }
    return grid.gridInstance;
}
