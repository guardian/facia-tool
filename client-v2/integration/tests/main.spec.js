import setup from '../server/setup';
import teardown from '../server/teardown';
import {
  frontDropZone,
  frontHeadline,
  frontSnapLink,
  feedItem,
  feedItemHeadline,
  guardianSnapLink,
  externalSnapLink
} from '../selectors';

fixture`Fronts edit`.page`http://localhost:3456/v2/editorial`
  .before(setup)
  .beforeEach(async t => await t.eval(() => (window.IS_INTEGRATION = true)))
  .after(teardown);

// quick and dirty check to see if there are any console errors on page load
test('Console errors', async t => {
  // await the front to load
  const topFrontHeadline = await frontHeadline(0).textContent;
  const { error } = await t.getBrowserConsoleMessages();
  await t.expect(error.length).eql(0);
});

test('Drag and drop', async t => {
  const topFrontHeadline = await frontHeadline(0).textContent;
  const topFeedHeadline = await feedItemHeadline(0).textContent;
  const frontDropsCount = await frontDropZone().count;
  await t
    // drag from feed to front
    .dragToElement(feedItem(0), frontDropZone(0))
    .wait(1000)
    .expect(frontDropZone().count)
    .eql(frontDropsCount + 2)
    .expect(frontHeadline().textContent)
    .notEql(topFrontHeadline)
    .expect(frontHeadline().textContent)
    .eql(topFeedHeadline)
    // drag top to bottom in front
    .dragToElement(frontHeadline(), frontDropZone(-1))
    // wait for collection to update
    .wait(1000)
    .expect(frontDropZone().count)
    .eql(frontDropsCount + 2)
    .expect(frontHeadline().textContent)
    .notEql(topFeedHeadline)
    .expect(frontHeadline().textContent)
    .eql(topFrontHeadline);
});

test('Snap Links - Guardian', async t => {
  const frontDropsCount = await frontDropZone().count;
  const tagSnap = await guardianSnapLink();
  await t
    .maximizeWindow() // needed to find DOM elements in headless mode
    .setNativeDialogHandler(() => false)
    .dragToElement(tagSnap, frontDropZone(1))
    .expect(frontDropZone().count)
    .eql(frontDropsCount + 1)
    .expect(frontSnapLink(0).textContent)
    .contains('Recipes | The Guardian')
    .expect(frontSnapLink(0).textContent)
    .notContains('Latest');
});

test('Snap Links - Guardian Latest', async t => {
  const frontDropsCount = await frontDropZone().count;
  const tagSnap = await guardianSnapLink();
  await t
    .maximizeWindow() // needed to find DOM elements in headless mode
    .setNativeDialogHandler(() => true)
    .dragToElement(tagSnap, frontDropZone(1))
    .expect(frontDropZone().count)
    .eql(frontDropsCount + 1)
    .expect(frontSnapLink(0).textContent)
    .contains('{ Recipes }')
    .expect(frontSnapLink(0).textContent)
    .contains('Latest');
});

test('Snap Links - External', async t => {
  const frontDropsCount = await frontDropZone().count;
  const externalSnap = await externalSnapLink();
  await t
    .maximizeWindow() // needed to find DOM elements in headless mode
    .setNativeDialogHandler(() => false)
    .dragToElement(externalSnap, frontDropZone(1))
    .expect(frontDropZone().count)
    .eql(frontDropsCount + 1)
    .expect(frontSnapLink(0).textContent)
    .contains('Business - BBC News');
});
