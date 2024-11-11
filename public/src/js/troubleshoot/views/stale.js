import template from 'troubleshoot/templates/stale.html!text';
import createScheduler from 'troubleshoot/scheduler';
import humanTime from 'utils/human-time';
import CONST from 'constants/defaults';

const disposeActions = [];
const STALE_NETWORK_FRONT = 6 * 60 * 1000;
const STALE_EDITORIAL_FRONT = 20 * 60 * 1000;
const STALE_COMMERCIAL_FRONT = 2.5 * 3600 * 1000;
const STALE_TRAINING_FRONT = 2.5 * 3600 * 1000;
const STALE_EMAIL_FRONT = 2.5 * 3600 * 1000;

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
    populateDefaults(container);
    registerListeners(container);
}

export function update (container) {
    populateDefaults(container);
}

function populateDefaults (container) {
    const match = window.location.pathname.match(/^.*\/stale\/(.*)$/);
    if (match) {
        const front = match[1];
        container.querySelector('.searchField').value = front;
        checkFront(container, front);
    }
}

function registerListeners (container) {
    const checkCallback = checkFront.bind(null, container, null);
    const checkFrontElement = container.querySelector('.checkFront');
    checkFrontElement.addEventListener('click', checkCallback);
    disposeActions.push(function () {
        checkFrontElement.removeEventListener('click', checkCallback);
    });
    const rePressFront = delegatePressFront.bind(null, container);
    container.addEventListener('click', rePressFront);
    disposeActions.push(function () {
        container.removeEventListener('click', rePressFront);
    });
    const submitCallback = checkFrontOnSubmit.bind(null, container);
    const formElements = Array.from(container.querySelectorAll('.form'));
    formElements.forEach(form => form.addEventListener('submit', submitCallback));
    disposeActions.push(function () {
        formElements.forEach(form => form.removeEventListener('submit', submitCallback));
    });
}

export function dispose () {
    disposeActions.forEach(action => action());
    disposeActions.length = 0;
}

function extractFrontName (container) {
    return container.querySelector('.searchField').value
        .replace(/https?:\/\/(www.)?theguardian.com\//, '')
        .replace(/^\/+/, '');
}

function checkFront (container, frontName) {
    const search = frontName || extractFrontName(container);

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
    }
    return config;
}

function fetchLastPressed (front) {
    return fetch('/front/lastmodifiedstatus/live/' + front, {
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject({
                status: 500,
                statusText: 'Error fetching press status: ' + response.statusText
            });
        }
    })
    .catch(errorResponse => {
        if (errorResponse.status === 404) {
            // Never pressed, probably invalid anyway
            return '';
        } else {
            return Promise.reject(new Error('Error while checking last press date of \'' + front + '\': ' + (errorResponse.responseText || errorResponse.statusText)));
        }
    });
}

function checkPressedState (front, config, container, lastPress) {
    const priority = config.fronts[front].priority || 'editorial';
    if (lastPress) {
        const date = new Date(lastPress.pressedTime);
        const now = new Date();

        if (now - date > staleInterval(front, config) || lastPress.statusCode !== 'ok') {
            return diagnoseStaleFront(container, front, priority, config, humanTime(date, now), lastPress);
        } else {
            return frontNotStale(container, front, priority, humanTime(date, now), lastPress);
        }
    } else {
        return diagnoseStaleFront(container, front, priority, config, null);
    }
}

function staleInterval (front, config) {
    if (CONST.highFrequencyPaths.indexOf(front) !== -1) {
        return STALE_NETWORK_FRONT;
    } else if (config.fronts[front].priority === 'commercial') {
        return STALE_COMMERCIAL_FRONT;
    } else if (config.fronts[front].priority === 'training') {
        return STALE_TRAINING_FRONT;
    } else if (config.fronts[front].priority === 'email') {
        return STALE_EMAIL_FRONT;
    } else {
        return STALE_EDITORIAL_FRONT;
    }
}

function inject (container, ...elements) {
    const placeholder = container.querySelector('.templatePlaceholder');
    placeholder.innerHTML = '';

    elements.filter(Boolean).forEach(element => placeholder.appendChild(element));
}

function diagnoseStaleFront (container, front, priority, config, when, status) {
    const troubleshootResults = clone('staleFront');
    troubleshootResults.querySelector('.lastModifyDate').textContent = when || 'never';
    troubleshootResults.querySelector('.frontName').textContent = front;
    troubleshootResults.querySelector('.frontPriority').textContent = priority;

    diagnoseCapiQueries(troubleshootResults, front, config, createScheduler());
    diagnoseLatestSnaps(troubleshootResults, front, config, createScheduler());
    populatePressErrorMessage(troubleshootResults, status);
    inject(container, troubleshootResults);

    container.querySelector('.rePress').dataset.frontName = front;
}

function diagnoseCapiQueries(container, front, config, scheduler) {
    const capiQueriesPlaceholder = container.querySelector('.capiQueries');
    const listOfQueries = config.fronts[front].collections.map(collectionId => {
        const collectionConfig = config.collections[collectionId];
        const backfill = collectionConfig.backfill || {};
        return {
            id: collectionId,
            name: collectionConfig.displayName,
            path: backfill.type === 'capi' ? backfill.query : null
        };
    })
    .filter(collection => !!collection.path);

    if (listOfQueries.length) {
        const innerElement = clone('capiQueries');
        innerElement.querySelector('.capiQueriesList').appendChild(generateCapiList(listOfQueries, scheduler));
        capiQueriesPlaceholder.appendChild(innerElement);
    } else {
        capiQueriesPlaceholder.appendChild(clone('emptyCapiQueriesList'));
    }

    scheduler.run().then(() => {
        capiQueriesPlaceholder.querySelector('.capiQueriesResult').classList.remove('loading');
    });
}

function diagnoseLatestSnaps(container, front, config, scheduler) {
    const latestSnapsPlaceholder = container.querySelector('.snapLatest');
    const listOfCollections = config.fronts[front].collections.map(collectionId => {
        return {
            id: collectionId,
            name: config.collections[collectionId].displayName
        };
    });
    const innerElement = clone('snapLatest');

    generateLatestSnapsList(innerElement.querySelector('.latestSnapsList'), listOfCollections, scheduler);
    latestSnapsPlaceholder.appendChild(innerElement);

    scheduler.run().then(() => {
        latestSnapsPlaceholder.querySelector('.snapLatestFetching').classList.remove('loading');
    });
}

function frontNotStale (container, front, priority, when, status) {
    const validMessage = clone('frontNotStale');
    validMessage.querySelector('.lastModifyDate').textContent = when;
    validMessage.querySelector('.frontName').textContent = front;
    validMessage.querySelector('.frontPriority').textContent = priority;
    populatePressErrorMessage(validMessage, status);

    inject(container, validMessage);
}

function populatePressErrorMessage (container, status) {
    const errorContainer = container.querySelector('.errorStatus');
    if (status.statusCode !== 'ok') {
        errorContainer.querySelector('.errorCount').textContent = status.errorCount;
        errorContainer.querySelector('.errorMessage').textContent = status.messageText;
        errorContainer.querySelector('.actionTime').textContent = humanTime(new Date(status.actionTime), new Date());
    } else {
        errorContainer.parentNode.removeChild(errorContainer);
    }
}

function reportError (container, error) {
    const invalidFront = clone('invalidFront');
    invalidFront.querySelector('.errorMessage').innerHTML = error.message;

    inject(container, invalidFront);
    // eslint-disable-next-line no-console
    console.error(error);
}

function generateCapiList (listOfQueries, scheduler) {
    const list = document.createDocumentFragment();

    listOfQueries.forEach(query => {
        const element = clone('capiQuery');
        element.querySelector('.capiQueryCollection').textContent = query.name;
        element.querySelector('.capiQueryPath').textContent = query.path;

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

function generateLatestSnapsList (listContainer, listOfCollections, scheduler) {
    listOfCollections.forEach(collection => {
        const element = clone('latestSnap');

        scheduler.job((id, el) => {
            return fetchCollectionContent(id)
            .then(filterLatestSnaps)
            .then(snaps => {
                if (snaps.length) {
                    fetchSnaps(collection, snaps, listContainer, scheduler);
                } else {
                    const emptyMessage = clone('emptyLatestSnapList');
                    emptyMessage.querySelector('.emptyLatestSnapCollection').textContent = collection.name;
                    listContainer.appendChild(emptyMessage);
                    markSuccess(el);
                }
            })
            .catch(markFailure.bind(null, el));
        }, [collection.id, element.querySelector('.latestSnap')]);
    });
}

function fetchCollectionContent (id) {
    return fetch('/collection/' + id, {
        credentials: 'include'
    })
    .then(response => response.json());
}

function filterLatestSnaps (json) {
    return ['live', 'draft', 'treats'].reduce((list, context) => {
        if (json && json[context]) {
            json[context].forEach(trail => {
                if (trail.meta && trail.meta.snapType === 'latest') {
                    list.push({
                        context,
                        trail
                    });
                } else if (trail.meta && trail.meta.supporting) {
                    trail.meta.supporting.forEach(sublink => {
                        if (sublink.meta && sublink.meta.snapType === 'latest') {
                            list.push({
                                context,
                                parent: trail,
                                trail: sublink
                            });
                        }
                    });
                }
            });
        }
        return list;
    }, []);
}

function fetchSnaps (collection, snapList, domList, scheduler) {
    snapList.forEach(snap => {
        const element = clone('latestSnap');
        element.querySelector('.latestSnapCollection').textContent = collection.name;
        element.querySelector('.latestSnapName').textContent = snap.trail.meta.customKicker;
        element.querySelector('.latestSnapContext').textContent = snap.context;

        if (snap.parent) {
            const parentTrail = clone('latestSnapSublink');
            const parentHeadline = snap.parent.meta && snap.parent.meta.headline ? snap.parent.meta.headline : snap.parent.id;
            parentTrail.querySelector('.latestSnapParent').textContent = parentHeadline;

            element.querySelector('.latestSnapIsSublink').appendChild(parentTrail);
        }

        scheduler.job((latestSnap, el) => {
            return fetchFromCapi(latestSnap.trail.meta.snapUri)
            .then(markSuccess.bind(null, el))
            .catch(markFailure.bind(null, el));
        }, [snap, element.querySelector('.latestSnap')]);

        domList.appendChild(element);
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

function delegatePressFront (container, evt) {
    if (evt.target.classList.contains('rePress')) {
        const frontName = evt.target.dataset.frontName;

        if (frontName) {
            pressFront(container, frontName);
        }
    }
}

function pressFront(container, front) {
    const button = container.querySelector('.rePress');
    const pressContainer = container.querySelector('.pressContainer');

    pressContainer.classList.add('loading');
    pressContainer.classList.remove('resultCorrect', 'resultInvalid');
    button.disabled = true;

    fetch('/press/live/' + front, {
        credentials: 'include',
        method: 'post'
    })
    // wait some time for the press action to be processed
    .then(() => new Promise(resolve => setTimeout(resolve, 2000)))
    .then(() => {
        pressContainer.classList.add('resultCorrect');
        checkFront(container, front);
    })
    .catch(() => {
        pressContainer.classList.add('resultInvalid');
    })
    .then(() => {
        pressContainer.classList.remove('loading');
        button.disabled = false;
    });
}

function checkFrontOnSubmit (container, event) {
    event.preventDefault();
    const frontName = extractFrontName(container);
    window.history.pushState(null, null, '/troubleshoot/stale/' + frontName);
}
