module.exports = function() {
    return {
        static: {
            options: {
                patterns: [{
                    match: 'jspm_packages/npm/font-awesome',
                    replacement: '/assets/jspm_packages/npm/font-awesome'
                }],
                usePrefix: false
            },
            files: [{
                expand: true,
                src: '*.js',
                cwd: 'public/fronts-client-v1/bundles',
                dest: 'public/fronts-client-v1/bundles/'
            }]
        }
    };
};
