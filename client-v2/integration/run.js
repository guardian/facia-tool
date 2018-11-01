const createTestCafe = require('testcafe');
const chromium = require('chromium');

let testcafe = null;
let runner = null;

createTestCafe('localhost', 1337, 1338)
  .then(tc => {
    testcafe = tc;
    runner = testcafe.createRunner();
    return runner
      .src('integration/tests/*.spec.js')
      .browsers(
        `chrome:${chromium.path}${
          process.argv.includes('--dev') ? '' : ':headless'
        }`
      )
      .run();
  })
  .then(failedCount => {
    testcafe.close();
    // bug with test cafe not closing with an exit code but we can do it like
    // this
    process.exit(failedCount ? 1 : 0);
  });
