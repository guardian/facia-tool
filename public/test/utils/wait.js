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

export function condition (predicate, timeout = 5000, interval = 50, label = '') {
	return new Promise((resolve, reject) => {
		const start = Date.now();
		const check = () => {
			let result;
			try {
				result = predicate();
			} catch (e) {
				reject(e);
				return;
			}
			if (result) {
				resolve();
			} else if (Date.now() - start >= timeout) {
				let msg = label
					? `Timeout waiting for condition: ${label}`
					: 'Timeout waiting for condition';
				reject(new Error(msg));
			} else {
				setTimeout(check, interval);
			}
		};
		check();
	});
}
