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
    // These containers are under development and are not yet ready for production.
    // They will need to be added to the types list in default.js when ready.
    if (res.defaults.env.toLowerCase() !== 'prod') {
        CONST.types.push(
             {
              'name': 'flexible/general',
              'groups': [
                'standard',
                'splash'
              ]
            },
            {
              'name': 'flexible/special',
              'groups': [
                'standard',
                'snap'
              ]
            });
    }
}

export function getPriority (priority) {
    return CONST.priorities[priority || CONST.defaultPriority] || {};
}
