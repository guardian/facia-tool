const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

enzyme.configure({ adapter: new Adapter() });

// ensure google tracking tag is there so as not to see console errors
window.gtag = () => {};

// ensures pageConfig data is mocked in all tests
jest.mock('util/extractConfigFromPage.ts');
