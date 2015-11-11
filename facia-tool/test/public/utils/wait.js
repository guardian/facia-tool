import Promise from 'Promise';
import mediator from 'utils/mediator';

export function event (name, emitter) {
    return new Promise((resolve, reject) => {
        var timeoutID = setTimeout(function () {
            reject(new Error('Timeout waiting for event ' + name));
        }, 2000);
        (emitter || mediator).once(name, function (eventObject) {
            clearTimeout(timeoutID);
            resolve(eventObject);
        });
    });
}

export function ms (time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}
