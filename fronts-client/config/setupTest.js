const fc = require('fast-check');
import 'whatwg-fetch';

// ensures pageConfig data is mocked in all tests
jest.mock('util/extractConfigFromPage.ts');

fc.configureGlobal({ numRuns: 20, verbose: true, endOnFailure: false });
