import _ from 'underscore';
import ko from 'knockout';

export default function(props, createObservable) {
    createObservable = createObservable || ko.observable;
    return _.object(_.map(props, function(prop) {
        return [prop, createObservable()];
    }));
}
