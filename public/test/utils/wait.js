import mediator from 'utils/mediator';

export function event (name, emitter) {
    let timeoutID;
    const promise = new Promise((resolve, reject) => {
        timeoutID = setTimeout(function () {
            reject(new Error('Timeout waiting for event ' + name));
        }, 2000);
        (emitter || mediator).once(name, function (eventObject) {
            clearTimeout(timeoutID);
            resolve(eventObject);
        });
    });
    promise.cancel = () => {
        clearTimeout(timeoutID);
    };
    return promise;
}

export function ms (time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}
