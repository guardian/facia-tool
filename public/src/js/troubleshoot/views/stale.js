import template from 'troubleshoot/templates/stale.html!text';
import * as scheduler from 'troubleshoot/scheduler';
import humanTime from 'utils/human-time';
import CONST from 'constants/defaults';

const disposeActions = [];
const STALE_NETWORK_FRONT = 5 * 3600 * 1000;
const STALE_EDITORIAL_FRONT = 20 * 3600 * 1000;
const STALE_COMMERCIAL_FRONT = 120 * 3600 * 1000;

var clone = (function (mainTemplateText) {
    const templatesMap = {};
    const templateElement = document.createElement('div');
    templateElement.innerHTML = mainTemplateText;

    return function (id) {
        if (!templatesMap[id]) {
            templatesMap[id] = templateElement.querySelector('#' + id);
            if (!templatesMap[id]) {
                throw new Error('Invalid template ID ' + id);
            }
        }
        return document.importNode(templatesMap[id].content, true);
    };
})(template);

export function render (container) {
    const mainView = clone('mainView');
    container.innerHTML = '';
    container.appendChild(mainView);
    registerListeners(container);
}

function registerListeners (container) {
    const checkCallback = checkFront.bind(null, container);
    container.querySelector('.checkFront').addEventListener('click', checkCallback);
    disposeActions.push(function () {
        container.querySelector('.checkFront').removeEventListener('click', checkCallback);
    });
}

export function dispose () {
    disposeActions.forEach(action => action());
    disposeActions.length = 0;
}

function checkFront (container) {
    const search = container.querySelector('.searchField').value.replace(/^\/+/, '');

    if (search) {
        fetchConfig()
        .then(checkExistingFront.bind(null, search))
        .then(config => {
            return fetchLastPressed(search)
            .then(checkPressedState.bind(null, search, config, container));
        })
        .catch(reportError.bind(null, container));
    }
}

function fetchConfig () {
    return fetch('/config', {
        credentials: 'include'
    })
    .then(response => response.json())
    .catch(() => {
        throw new Error('Invalid configuration. Please try again or ask for help.');
    });
}

function checkExistingFront (front, config) {
    if (!config.fronts[front]) {
        throw new Error('Front \'' + front + '\' does not exist. Please check the name and try again.');
    } else if (config.fronts[front].priority === 'training') {
        throw new Error('Front \'' + front + '\' is a training front. It never gets pressed.');
    }
    return config;
}

function fetchLastPressed (front) {
    return fetch('/front/lastmodified/' + front, {
        credentials: 'include'
    })
    .then(response => response.text())
    .catch(errorResponse => {
        if (errorResponse.status === 404) {
            // Never pressed, probably invalid anyway
            return '';
        } else {
            throw new Error('Error while checking last press date of \'' + front + '\': ' + errorResponse.responseText || errorResponse.statusText);
        }
    });
}

function checkPressedState (front, config, container, lastPress) {
    if (lastPress) {
        const date = new Date(lastPress);
        const now = new Date();

        if (now - date > staleInterval(front, config)) {
            return diagnoseStaleFront(container, front, config, humanTime(date, now));
        } else {
            return frontNotStale(container, humanTime(date, now));
        }
    } else {
        return diagnoseStaleFront(container, front, config, null);
    }
}

function staleInterval (front, config) {
    if (CONST.highFrequencyPaths.indexOf(front) !== -1) {
        return STALE_NETWORK_FRONT;
    } else if (!!config.fronts[front].priority) {
        return STALE_COMMERCIAL_FRONT;
    } else {
        return STALE_EDITORIAL_FRONT;
    }
}

function inject (container, element) {
    const placeholder = container.querySelector('.templatePlaceholder');
    placeholder.innerHTML = '';

    placeholder.appendChild(element);
}

function diagnoseStaleFront (container, front, config, when) {
    const troubleshootResults = clone('staleFront');
    troubleshootResults.querySelector('.lastModifyDate').innerHTML = when;

    const capiQueriesPlaceholder = troubleshootResults.querySelector('.capiQueries');
    const listOfQueries = config.fronts[front].collections.map(collectionId => {
        return {
            id: collectionId,
            name: config.collections[collectionId].displayName,
            path: config.collections[collectionId].apiQuery
        };
    })
    .filter(collection => !!collection.path);

    if (listOfQueries.length) {
        const innerElement = clone('capiQueries');
        innerElement.querySelector('.capiQueriesList').appendChild(generateCapiList(listOfQueries));
        capiQueriesPlaceholder.appendChild(innerElement);
    } else {
        capiQueriesPlaceholder.querySelector('.capiQueriesResult').classList.remove('loading');
        capiQueriesPlaceholder.appendChild(clone('emptyCapiQueriesList'));
    }

    inject(container, troubleshootResults);

    scheduler.run().then(result => {
        console.log('sched end', result);
        capiQueriesPlaceholder.querySelector('.capiQueriesResult').classList.remove('loading');
    });
}

function frontNotStale (container, when) {
    const validMessage = clone('frontNotStale');
    validMessage.querySelector('.lastModifyDate').innerHTML = when;

    inject(container, validMessage);
}

function reportError (container, error) {
    const invalidFront = clone('invalidFront');
    invalidFront.querySelector('.errorMessage').innerHTML = error.message;

    inject(container, invalidFront);
    console.error(error);
}

function generateCapiList (listOfQueries) {
    const list = document.createDocumentFragment();

    listOfQueries.forEach(query => {
        const element = clone('capiQuery');
        element.querySelector('.capiQueryCollection').innerHTML = query.name;
        element.querySelector('.capiQueryPath').innerHTML = query.path;

        scheduler.job((path, el) => {
            return fetchFromCapi(path)
            .then(markSuccess.bind(null, el))
            .catch(markFailure.bind(null, el));
        }, [query.path, element.querySelector('.capiQuery')]);

        list.appendChild(element);
    });

    return list;
}

function fetchFromCapi (query) {
    return fetch('/api/live/' + query, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(json => {
        if (!json.response || json.response.status === 'error') {
            throw new Error('Invalid CAPI request: ' + json.response);
        }
    });
}

function markSuccess (element) {
    element.classList.remove('loading');
    element.classList.add('resultCorrect');
}

function markFailure (element) {
    element.classList.remove('loading');
    element.classList.add('resultInvalid');
}
