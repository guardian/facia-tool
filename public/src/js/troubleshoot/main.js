/* eslint no-console: 0 */
const DEFAULT_VIEW = 'stale';
const VIEWS_INSTANCES = {};
let currentLoadedView;
let currentLoadedViewInstance;

window.addEventListener('hashchange', loadFromHash);
loadFromHash();

function loadFromHash() {
    const view = location.hash.substring(1) || DEFAULT_VIEW;

    if (!VIEWS_INSTANCES[view]) {
        System.import('troubleshoot/views/' + view)
        .then(viewInstance => {
            VIEWS_INSTANCES[view] = viewInstance;
            renderViewInstance(view, viewInstance);
        })
        .catch(console.error);
    } else {
        renderViewInstance(view, VIEWS_INSTANCES[view]);
    }
}

function renderViewInstance(view, instance) {
    if (currentLoadedView !== view) {
        disposePreviousView()
        .then(() => instance.render(document.querySelector('.mainContainer')))
        .then(() => {
            currentLoadedViewInstance = instance;
            currentLoadedView = view;
        });
    }
}

function disposePreviousView () {
    if (currentLoadedViewInstance && currentLoadedView.dispose) {
        return Promise.resolve(currentLoadedView.dispose()).then(() => {
            currentLoadedView = null;
            currentLoadedViewInstance = null;
        });
    } else {
        return Promise.resolve();
    }
}
