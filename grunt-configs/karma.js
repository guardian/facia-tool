module.exports = function(grunt, options) {
    return {
        options: {
            frameworks: ['jasmine'],
            reporters: ['spec'],
            singleRun: options.singleRun,
            browserDisconnectTimeout: 10000,
            browserDisconnectTolerance: 3,
            browserNoActivityTimeout: 400000,
            reportSlowerThan: 3000,
            colors: options.color,
            port: 9876,
            autoWatch: true,
            browsers: ['ChromeHeadless'],
            captureTimeout: 60000
        },
        'static': {
            configFile: 'public/test/conf/karma.conf.js'
        }
    };
};
