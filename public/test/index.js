/* eslint no-console: 0 */
// Make karma asynchronous
window.__karma__.loaded = function () {};
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

System.config({
    map: {
        'test': '/test',
        'mock': '/test/mocks',
        'views': '/app/views'
    }
});

System.import('./base/public/test/test-main').then(function (testRunner) {
    var filterTests = document.location.search.match(/[?&]test=[a-z-.]+/gi) || [];

    return testRunner.run(filterTests, window.__karma__.files);
})
.then(function () {
    window.__karma__.start();
})
.catch(function (ex) {
    document.body.innerHTML = 'Something went horribly wrong';
    console.error(ex);
    throw ex;
});
