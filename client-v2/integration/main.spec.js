const webdriver = require('selenium-webdriver');
const { Builder, By, until } = webdriver;

const chromeCapabilities = webdriver.Capabilities.chrome();
// chromeCapabilities.set('chromeOptions', { args: ['--headless'] });

jest.setTimeout(10000);

let driver;

describe('Fronts', () => {
  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser('chrome')
      .withCapabilities(chromeCapabilities)
      .build();
  });

  it('should display "fronts" text on page', async () => {
    await driver.get('http://localhost:3456/v2/editorial');
    const dropZoneSelector = By.css('[data-test="drop-zone"]');
    const feedItemSelector = By.css('[data-test="feed-item"]');
    await driver.wait(until.elementsLocated(dropZoneSelector));
    await driver.wait(until.elementsLocated(feedItemSelector));
    const feedItems = await driver.findElements(feedItemSelector);
    const preDropZones = await driver.findElements(dropZoneSelector);
    const preDropZoneCount = preDropZones.length;
    await driver
      .actions({ bridge: true })
      .move({ origin: feedItems[1], x: 10, y: 10 })
      .press()
      .move({
        x: 10,
        y: 10,
        origin: preDropZones[5]
      })
      .release()
      .perform();
    await driver.sleep(1000);
    const postDropZones = await driver.findElements(dropZoneSelector);
    const postDropZoneCount = postDropZones.length;
    console.log(preDropZoneCount, postDropZoneCount);
  });

  afterAll(() => {
    driver.quit();
  });
});
