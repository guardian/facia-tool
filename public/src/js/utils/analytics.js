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
        if (window.ga) {
            ga('send', 'event', category, action, value, {
                hitCallback: () => resolve()
            });
        }
    });
}

export function trackStaticResourceTiming () {
    if (canMeasureTime()) {
        const staticFile = performance.getEntriesByType('resource').filter(isStatic);
        if (staticFile.length === 1) {
            const res = staticFile[0];
            ga('send', 'timing', 'JS', 'static-download', res.responseEnd - res.responseStart);
            ga('send', 'timing', 'JS', 'static', res.responseEnd - res.connectStart);
        }
    }
}

function isStatic (resource) {
    return resource.initiatorType === 'script' && resource.name.indexOf('//fronts-static.') !== -1;
}

function canMeasureTime () {
    return window.ga && window.performance;
}

function now () {
    return Math.round(performance.now());
}
