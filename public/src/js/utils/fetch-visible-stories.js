import _ from 'underscore';
import {request} from '../modules/authed-ajax';
import mediator from '../utils/mediator';

export default function(type, groups) {
    var promisedAction;
    var stories = [];
    _.each(groups, function (group) {
        _.each(group.items(), function (story) {
            stories.push({
                group: story.group.index,
                isBoosted: !!story.meta.isBoosted()
            });
        });
    });


    if (!stories.length) {
        promisedAction = Promise.reject(new Error('Empty collection'));
    } else {
        promisedAction = request({
            url: '/stories-visible/' + type,
            method: 'POST',
            data: JSON.stringify({
                stories: stories
            }),
            dataType: 'json'
        })
        .then(result => {
            promisedAction.timeoutId = setTimeout(() => mediator.emit('visible:stories:fetch', result), 10);
            return result;
        })
        .catch(function (error) {
            throw new Error('Error in stories visibile: ' + error.statusText);
        });
    }

    promisedAction.dispose = function () {
        clearTimeout(promisedAction.timeoutId);
    };
    return promisedAction;
}
