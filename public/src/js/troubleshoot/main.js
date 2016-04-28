const DEFAULT_VIEW = 'stale';
const VIEWS_INSTANCES = {};
let currentLoadedView;
let currentLoadedViewInstance;

loadFrom(viewFromLocation);
window.addEventListener('click', interceptNavigation, true);
window.onpopstate = function () {
    loadFrom(viewFromLocation);
};

function viewFromLocation(pathname = location.pathname) {
    const path = pathname.replace(/^.*troubleshoot\//, '');
    return (path.split('/') || [])[0] || DEFAULT_VIEW;
}
function loadFrom(viewExtractor) {
    const view = viewExtractor();

    if (!VIEWS_INSTANCES[view]) {
        System.import('troubleshoot/views/' + view)
        .then(viewInstance => {
            VIEWS_INSTANCES[view] = viewInstance;
            renderViewInstance(view, viewInstance);
        })
        // eslint-disable-next-line no-console
        .catch(console.error);
    } else {
        renderViewInstance(view, VIEWS_INSTANCES[view]);
    }
}

function renderViewInstance(view, instance) {
    const container = document.querySelector('.mainContainer');
    if (currentLoadedView !== view) {
        disposePreviousView()
        .then(() => instance.render(container))
        .then(() => {
            currentLoadedViewInstance = instance;
            currentLoadedView = view;
        });
    } else {
        currentLoadedViewInstance.update(container);
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

function interceptNavigation (event) {
    const navigationItem = findNavigationItemInAncestor(event.target);
    if (navigationItem) {
        event.preventDefault();
        window.history.pushState(null, null, navigationItem.path);
        loadFrom(() => viewFromLocation(navigationItem.path));
    }
}

function findNavigationItemInAncestor (target) {
    if (!target || !document.body.contains(target)) {
        return undefined;
    } else if (target.classList.contains('navigationItem_link')) {
        return {
            path: target.href
        };
    } else {
        return findNavigationItemInAncestor(target.parentNode);
    }
}
