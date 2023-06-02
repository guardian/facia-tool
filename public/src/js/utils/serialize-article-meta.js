import _ from 'underscore';
import sanitizeHtml from '../utils/sanitize-html';
import fullTrim from '../utils/full-trim';

export default function (article) {
    const cleanMeta = _.chain(article.meta)
        .pairs()
        // execute any knockout values:
        .map(p => [p[0], _.isFunction(p[1]) ? p[1]() : p[1]])
        // trim and sanitize strings:
        .map(p => [p[0], _.isString(p[1]) ? sanitizeHtml(fullTrim(p[1])).trim() : p[1]])
        // reject falsy values
        .filter(p => {
            // there's a transition period, we want to be explicit about truthy defaults.
            // Old stories will have (hide, show) => (showQuotedHeadline: false, nothing)
            // In the future ideal world that should be converted to (hide, show) => (nothing, showQuotedHeadline: true)
            // For now convert to (hide, show) => (showQuotedHeadline: false, showQuotedHeadline: true)
            // while hiding all other fields that have a falsy value
            if (_.has(article.metaDefaults, p[0]) && article.metaDefaults[p[0]] === true) {
                return true;
            } else {
                // after the transition, this is the only check to be performed by this function
                return !!p[1];
            }
        })
        // reject vals that are equivalent to the fields (if any) that they're overwriting:
        .filter(p => _.isUndefined(article.fields[p[0]]) || p[1] !== fullTrim(article.fields[p[0]]()))
        // convert numbers to strings:
        .map(p => [p[0], maybeNumberToString(p[1])])
        // recurse into supporting links
        .map(p => [p[0], p[0] === 'supporting' ? _.map(p[1].items(), item => item.get()) : p[1]])
        // clean sparse arrays
        .map(function (p) {
            return [p[0], _.isArray(p[1]) ? _.filter(p[1], function (item) { return !!item; }) : p[1]];
        })
        // drop empty arrays:
        .filter(p => _.isArray(p[1]) ? p[1].length : true)
        // recurse convert numbers to strings:
        .map(p => [p[0], _.isArray(p[1]) ? _.map(p[1], function (nested) {
            return _.isObject(nested) ? _.mapObject(nested, maybeNumberToString) : nested; }) : p[1]]
        )
        // return as obj, or as undefined if empty (this omits it from any subsequent JSON.stringify result)
        .reduce(function(obj, p) {
            obj = obj || {};
            obj[p[0]] = p[1];
            return obj;
        }, {})
        .value();

    if (article.group && article.group.parentType === 'Collection') {
        cleanMeta.group = article.group.index + '';
    }

    return _.isEmpty(cleanMeta) ? undefined : cleanMeta;
}

function maybeNumberToString (val) {
    return _.isNumber(val) ? '' + val : val;
}
