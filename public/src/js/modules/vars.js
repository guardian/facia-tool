import CONST from 'constants/defaults';

export {CONST};

export let model;
export function setModel (currentModel) {
    model = currentModel;
}

export function init (res) {
    if (res.defaults.switches['']) {
        CONST.types.push({ 'name': 'all-items/not-for-production' });
    }
    // if (res.defaults.userdata.featureSwitches['use-new-containers']) {
    //     CONST.types.push([
    //          {
    //           'name': 'dynamic/fast-v2',
    //           'groups': [
    //             'standard',
    //             'splash'
    //           ]
    //         },
    //         {
    //           'name': 'dynamic/package-v2',
    //           'groups': [
    //             'standard',
    //             'snap'
    //           ]
    //         }]);
    // }
}

export function getPriority (priority) {
    return CONST.priorities[priority || CONST.defaultPriority] || {};
}
