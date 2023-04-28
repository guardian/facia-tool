const fc = require('fast-check');
import 'whatwg-fetch';

// ensure google tracking tag is there so as not to see console errors
window.gtag = () => {};

// ensures pageConfig data is mocked in all tests
jest.mock('util/extractConfigFromPage.ts');

fc.configureGlobal({ numRuns: 20, verbose: true, endOnFailure: false });
