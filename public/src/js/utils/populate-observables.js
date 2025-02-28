import _ from 'underscore';

function populateObservables(target, opts) {
    if (!_.isObject(target) || !_.isObject(opts)) {
        return;
    }
    _.keys(target).forEach((key) => {
        if (_.isFunction(target[key]) && _.isUndefined(target[key]())) {
            target[key](opts[key]);
        } else if (_.isObject(target[key]) && _.isObject(opts[key])) {
            populateObservables(target[key], opts[key]);
        } else if (_.isFunction(target[key]) && !_.isUndefined(target[key]()) && _.isArray(target[key]()) && _.isArray(opts[key])) {
            target[key]().forEach((item) => {
              populateObservables(item, opts[key]);
            });
        }
    });
}

export default populateObservables;
