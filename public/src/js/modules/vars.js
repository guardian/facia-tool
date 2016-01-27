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
}

export function getPriority (priority) {
    return CONST.priorities[priority || CONST.defaultPriority] || {};
}
