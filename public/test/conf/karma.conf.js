/* eslint-env node */

const puppeteer = require('puppeteer');
process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = function(config) {
  config.set({
    basePath: '../../..',
    proxies: {
        '/assets/': '/base/public/src/',
        '/test/': '/base/public/test/',
        '/app/': '/base/app/'
    },
    frameworks: ['jasmine'],
    files: [
        {pattern: 'public/src/jspm_packages/github/es-shims/**/es5-shim.min.js', included: true, watched: false},
        {pattern: 'public/src/jspm_packages/!(system).js', included: false, watched: false},
        {pattern: 'public/src/jspm_packages/system.js', included: true, watched: false},
        {pattern: 'public/src/jspm_packages/**/*', included: false, watched: false},
        {pattern: 'public/src/js/jspm-config.js', included: true, watched: false},
        {pattern: 'public/src/js/components/**/*', included: false, watched: false},
        {pattern: 'app/views/**/*.html', included: false},
        {pattern: 'public/src/js/**/*', included: false},
        {pattern: 'public/src/css/*.css', included: true, watched: false},
        {pattern: 'public/src/css/!(*.css)', included: false, watched: false},
        {pattern: 'public/test/**/!(index.js)', included: false},
        {pattern: 'public/test/index.js', included: true}
    ],

    exclude: [],

    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],
    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,
    autoWatch: true,

    browsers: ['ChromeHeadless'],
    captureTimeout: 60000,
    singleRun: false
  });
};
