import $ from 'jquery';
window.jQuery = $;

import ko from 'knockout';
import Raven from 'raven-js';
import Bootstrap from './modules/bootstrap';
import {trackStaticResourceTiming} from './utils/analytics';
import logger from './utils/logger';
import oauthSession from './utils/oauth-session';
import Router from './modules/router';
import handlers from './modules/route-handlers';

var router, bootstrap;

function terminate (error) {
    if (error) {
        logger.error(error);
        // eslint-disable-next-line no-alert
        window.alert(error);
    }
    window.location.href = '/logout';
}

function checkEnabled (res) {
    if (res.defaults.switches['facia-tool-disable']) {
        terminate('The application is disabled, sorry.');
    }
}

function registerRaven (res) {
    if (res.defaults.env.toUpperCase() !== 'DEV' && res.defaults.sentryPublicDSN) {
        const sentryOptions = {
            tags: {
                stack: 'cms-fronts',
                stage: res.defaults.env.toUpperCase(),
                app: 'facia-tool'
            }
        };

        Raven.config(res.defaults.sentryPublicDSN, sentryOptions).install();
        Raven.setUser({
            email: res.defaults.email || 'anonymous'
        });
        // ES6 loader uses console.error to log un-handled rejected promises
        var originalConsole = window.console.error;
        window.console.error = function () {
            originalConsole.apply(window.console, arguments);
            Raven.captureMessage([].slice.apply(arguments).join(' '));
        };
    }
}

function loadApp (res) {
    var model = router.load(res);
    ko.applyBindings(model);
    model.loaded.then(() => {
        bootstrap.every(updatedRes => model.update(updatedRes));
        model.on('config:needs:update', callback => {
            bootstrap.get().onload(callback).onfail(callback);
        });
        oauthSession();
        trackStaticResourceTiming();
    });
}

router = new Router(handlers);

bootstrap = new Bootstrap()
    .onload(checkEnabled)
    .onload(registerRaven)
    .onload(loadApp)
    .onfail(terminate);
