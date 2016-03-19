import template from 'troubleshoot/templates/stale.html!text';
import createScheduler from 'troubleshoot/scheduler';
import humanTime from 'utils/human-time';
import CONST from 'constants/defaults';

const disposeActions = [];
const STALE_NETWORK_FRONT = 6 * 60 * 1000;
const STALE_EDITORIAL_FRONT = 20 * 60 * 1000;
const STALE_COMMERCIAL_FRONT = 2.5 * 3600 * 1000;

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
    const checkCallback = checkFront.bind(null, container, null);
    container.querySelector('.checkFront').addEventListener('click', checkCallback);
    disposeActions.push(function () {
        container.querySelector('.checkFront').removeEventListener('click', checkCallback);
    });
    const rePressFront = delegatePressFront.bind(null, container);
    container.addEventListener('click', rePressFront);
    disposeActions.push(function () {
        container.removeEventListener('click', rePressFront);
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
            return frontNotStale(container, front, humanTime(date, now));
        }
    } else {
        return diagnoseStaleFront(container, front, config, null);
    }
}

function staleInterval (front, config) {
    if (CONST.highFrequencyPaths.indexOf(front) !== -1) {
        return STALE_NETWORK_FRONT;
    } else if (config.fronts[front].priority) {
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
    troubleshootResults.querySelector('.lastModifyDate').textContent = when || 'never';
    troubleshootResults.querySelector('.frontName').textContent = front;

    diagnoseCapiQueries(troubleshootResults, front, config, createScheduler());
    diagnoseDreamSnaps(troubleshootResults, front, config, createScheduler());
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
        capiQueriesPlaceholder.querySelector('.capiQueriesResult').classList.remove('loading');
        capiQueriesPlaceholder.appendChild(clone('emptyCapiQueriesList'));
    }

    scheduler.run().then(() => {
        capiQueriesPlaceholder.querySelector('.capiQueriesResult').classList.remove('loading');
    });
}

function diagnoseDreamSnaps(container, front, config, scheduler) {
    const dreamSnapsPlaceholder = container.querySelector('.snapLatest');
    const listOfCollections = config.fronts[front].collections.map(collectionId => {
        return {
            id: collectionId,
            name: config.collections[collectionId].displayName
        };
    });
    const innerElement = clone('snapLatest');

    generateDreamSnapsList(innerElement.querySelector('.dreamSnapsList'), listOfCollections, scheduler);
    dreamSnapsPlaceholder.appendChild(innerElement);

    scheduler.run().then(() => {
        dreamSnapsPlaceholder.querySelector('.snapLatestFetching').classList.remove('loading');
    });
}

function frontNotStale (container, front, when) {
    const validMessage = clone('frontNotStale');
    validMessage.querySelector('.lastModifyDate').textContent = when;
    validMessage.querySelector('.frontName').textContent = front;

    inject(container, validMessage);
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

function generateDreamSnapsList (listContainer, listOfCollections, scheduler) {
    listOfCollections.forEach(collection => {
        const element = clone('dreamSnap');

        scheduler.job((id, el) => {
            return fetchCollectionContent(id)
            .then(filterDreamSnaps)
            .then(snaps => {
                if (snaps.length) {
                    fetchSnaps(collection, snaps, listContainer, scheduler);
                } else {
                    const emptyMessage = clone('emptyDreamSnapList');
                    emptyMessage.querySelector('.emptyDreamSnapCollection').textContent = collection.name;
                    listContainer.appendChild(emptyMessage);
                    markSuccess(el);
                }
            })
            .catch(markFailure.bind(null, el));
        }, [collection.id, element.querySelector('.dreamSnap')]);
    });
}

function fetchCollectionContent (id) {
    return fetch('/collection/' + id, {
        credentials: 'include'
    })
    .then(response => response.json());
}

function filterDreamSnaps (json) {
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
        const element = clone('dreamSnap');
        element.querySelector('.dreamSnapCollection').textContent = collection.name;
        element.querySelector('.dreamSnapName').textContent = snap.trail.meta.customKicker;
        element.querySelector('.dreamSnapContext').textContent = snap.context;

        if (snap.parent) {
            const parentTrail = clone('dreamSnapSublink');
            const parentHeadline = snap.parent.meta && snap.parent.meta.headline ? snap.parent.meta.headline : snap.parent.id;
            parentTrail.querySelector('.dreamSnapParent').textContent = parentHeadline;

            element.querySelector('.dreamSnapIsSublink').appendChild(parentTrail);
        }

        scheduler.job((dreamSnap, el) => {
            return fetchFromCapi(dreamSnap.trail.meta.snapUri)
            .then(markSuccess.bind(null, el))
            .catch(markFailure.bind(null, el));
        }, [snap, element.querySelector('.dreamSnap')]);

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
