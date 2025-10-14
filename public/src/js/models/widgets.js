/* globals System */
import ko from 'knockout';
import _ from 'underscore';

var register = _.once(() => {
    ko.components.loaders.unshift({
        loadTemplate: function (name, templateConfig, callback) {
            if (typeof templateConfig !== 'object' || !('text' in templateConfig)) {
                callback(null);
                return;
            }

            System.import(templateConfig.text + '!text').then(function (text) {
                callback(ko.utils.parseHtmlFragment(text));
            });
        },
        loadViewModel: function (name, templateConfig, callback) {
            if (typeof templateConfig !== 'object' || !('jspm' in templateConfig)) {
                callback(null);
                return;
            }

            System.import('facia-tool/' + templateConfig.jspm).then(function (Component) {
                callback(function (params, componentInfo) {
                    if (Component.default) {
                        Component = Component.default;
                    }
                    return new Component(params, componentInfo.element);
                });
            });
        }
    });
    ko.components.register('fronts-widget', {
        viewModel: { jspm: 'widgets/columns/fronts' },
        template: { text: 'widgets/columns/fronts.html' }
    });
    ko.components.register('latest-widget', {
        viewModel: { jspm: 'widgets/columns/latest' },
        template: { text: 'widgets/columns/latest.html' }
    });
    ko.components.register('search-controls', {
        viewModel: {
            createViewModel: (params) => params.context.$data
        },
        template: { text: 'widgets/search_controls.html' }
    });
    ko.components.register('collection-widget', {
        viewModel: {
            createViewModel: (params) => params.context.$data
        },
        template: { text: 'widgets/collection.html' }
    });
    ko.components.register('trail-widget', {
        viewModel: {
            createViewModel: (params) => params.context.$data
        },
        synchronous: true,
        template: { text: 'widgets/trail.html' }
    });
    ko.components.register('trail-editor-widget', {
        viewModel: {
            createViewModel: (params) => params.context.$data
        },
        synchronous: true,
        template: { text: 'widgets/trail-editor.html' }
    });
    ko.components.register('clipboard-widget', {
        viewModel: { jspm: 'widgets/clipboard' },
        template: { text: 'widgets/clipboard.html' }
    });
    ko.components.register('fronts-standalone-clipboard', {
        viewModel: { jspm: 'widgets/columns/fronts-standalone-clipboard' },
        template: { text: 'widgets/columns/fronts-standalone-clipboard.html' }
    });
    ko.components.register('modal-dialog', {
        viewModel: {
            createViewModel: (params) => params.modal
        },
        template: { text: 'widgets/modals/modal-dialog.html' }
    });
    ko.components.register('confirm_breaking_changes', {
        viewModel: {
            createViewModel: (params) => params
        },
        template: { text: 'widgets/modals/confirm-breaking-changes.html' }
    });
    ko.components.register('text_alert', {
        viewModel: {
            createViewModel: (params) => params
        },
        template: { text: 'widgets/modals/text-alert.html' }
    });
    ko.components.register('success_alert', {
        viewModel: {
            createViewModel: (params) => params
        },
        template: { text: 'widgets/modals/success-alert.html' }
    });
    ko.components.register('select_snap_type', {
        viewModel: {
            createViewModel: (params) => params
        },
        template: { text: 'widgets/modals/select-snap-type.html' }
    });
    ko.components.register('collection_cap_alert', {
        viewModel: {
            createViewModel: (params) => params
        },
        template: { text: 'widgets/modals/collection-cap-alert.html' }
    });
    ko.components.register('autocomplete', {
        viewModel: { jspm: 'widgets/autocomplete' },
        template: { text: 'widgets/autocomplete.html' }
    });
    ko.components.register('fronts-search-widget', {
        viewModel: { jspm: 'widgets/columns/fronts-search' },
        template: { text: 'widgets/columns/fronts-search.html' }
    });
    ko.components.register('fronts-config-widget', {
        viewModel: { jspm: 'widgets/columns/fronts-config' },
        template: { text: 'widgets/columns/fronts-config.html' }
    });
    ko.components.register('config-collection-backfill', {
        viewModel: { jspm: 'widgets/config-collection-backfill' },
        synchronous: true,
        template: { text: 'widgets/config-collection-backfill.html' }
    });
    ko.components.register('config-collection-tags', {
        viewModel: { jspm: 'widgets/config-collection-tags' },
        synchronous: true,
        template: { text: 'widgets/config-collection-tags.html' }
    });
    ko.components.register('message', {
        viewModel: {
            createViewModel: (params) => params.message
        },
        template: { text: 'widgets/message.html' }
    });
    ko.components.register('presser-detect-stale', {
        viewModel: { jspm: 'widgets/presser-detect-stale' },
        template: { text: 'widgets/presser-detect-stale.html' }
    });
    ko.components.register('copy-paste-articles', {
        viewModel: { jspm: 'widgets/copy-paste-articles' },
        template: '<!-- copy paste articles -->'
    });
    ko.components.register('sparklines-trails', {
        viewModel: { jspm: 'widgets/sparklines-trails' },
        template: '<!-- sparklines for trails -->'
    });
    ko.components.register('config-card-types', {
        viewModel: { jspm: 'widgets/config-card-types' },
        template: '<!-- card types -->'
    });
    ko.components.register('config-nav-sections', {
        viewModel: { jspm: 'widgets/config-nav-sections' },
        template: '<!-- nav sections -->'
    });
    ko.bindingHandlers.ownerClass = {
        init: function (element, valueAccessor) {
            var owner = valueAccessor();
            if (owner.registerElement) {
                owner.registerElement(element);
            }
        }
    };
});

export {
    register
};
