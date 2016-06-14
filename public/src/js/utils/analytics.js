/* global ga */
export function time (category, timingVar) {
    if (canMeasureTime()) {
        ga('send', 'timing', category, timingVar, now());
    }
}

export function page (path, title) {
    if (canMeasureTime()) {
        ga('set', 'page', path, title);
        ga('send', 'pageview');
    }
}

export function trackAction (category, action, value) {
    return new Promise(resolve => {
        ga('send', 'event', category, action, value, {
            hitCallback: () => resolve()
        });
    });
}

function canMeasureTime () {
    return window.ga && window.performance;
}

function now () {
    return Math.round(performance.now());
}
