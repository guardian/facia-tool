'use strict';
module.exports = function() {
    return {
        collections: {
            command:
                'npm run jspm bundle ' +
                [
                    'setup',
                    'main',
                    'facia-tool/widgets/columns/fronts',
                    'facia-tool/widgets/columns/latest',
                    'facia-tool/widgets/clipboard',
                    'facia-tool/widgets/columns/fronts-standalone-clipboard',
                    'facia-tool/widgets/autocomplete',
                    'facia-tool/widgets/presser-detect-stale',
                    'facia-tool/widgets/copy-paste-articles',
                    'facia-tool/widgets/sparklines-trails',
                    'facia-tool/widgets/front-article-indicator'
                ].join(' + ') +
                ' public/fronts-client-v1/bundles/collections.js'
        },
        config: {
            command:
                'npm run jspm bundle ' +
                [
                    'setup',
                    'main',
                    'facia-tool/widgets/columns/fronts-search',
                    'facia-tool/widgets/columns/fronts-config',
                    'facia-tool/widgets/config-collection-backfill',
                    'facia-tool/widgets/config-collection-tags',
                    'facia-tool/widgets/config-card-types',
                    'facia-tool/widgets/config-nav-sections'
                ].join(' + ') +
                ' public/fronts-client-v1/bundles/config.js'
        }
    };
};
