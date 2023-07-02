const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const fc = require('fast-check');

enzyme.configure({ adapter: new Adapter() });

// ensures pageConfig data is mocked in all tests
jest.mock('util/extractConfigFromPage.ts');

fc.configureGlobal({ numRuns: 20, verbose: true, endOnFailure: false });
