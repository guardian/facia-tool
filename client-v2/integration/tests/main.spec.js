import setup from '../server/setup';
import teardown from '../server/teardown';
import {
  frontDropZone,
  frontHeadline,
  frontSnapLink,
  feedItem,
  feedItemHeadline,
  guardianSnapLink,
  externalSnapLink,
  previouslyToggle,
  previouslyDropZone,
  previouslyItem,
  clipboardWrapper,
  clipboardItem,
  hoverOverlay,
  collection,
  collectionItem,
  collectionDropZone,
  collectionItemHoverZone,
  allCollectionItems,
  allCollectionDropZones,
  collectionItemDeleteButton,
  collectionDiscardButton,
  collectionItemAddToClipboardButton,
  clipboardItemDeleteButton
} from '../selectors';

fixture`Fronts edit`.page`http://localhost:3456/v2/editorial`
  .before(setup)
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

test('Drag between two collections', async t => {
  const firstCollectionStory = collectionItem(0, 0);
  const secondCollectionDropZone = collectionDropZone(1, 0);
  await t
    .dragToElement(firstCollectionStory, secondCollectionDropZone)
    .expect(allCollectionItems(0).count)
    .eql(0)
    .expect(allCollectionItems(1).count)
    .eql(1);
});

test('Drag from clipboard to collection', async t => {
  const firstCollectionStoryCount = await allCollectionItems(0).count;
  const clipboardStoryCount = await clipboardItem().count;
  await t
    .dragToElement(clipboardItem(), collection(0))
    .expect(allCollectionItems(0).count)
    .eql(firstCollectionStoryCount + 1)
    .expect(clipboardItem().count)
    .eql(clipboardStoryCount);
});

test('Discarding changes to a collection works', async t => {
  await t
    .click(collectionDiscardButton(1))
    .expect(allCollectionItems(1).count) // discarding overwrites a collection's draft content with its live content
    .eql(0);
});

test('Snap Links - Guardian', async t => {
  const frontDropsCount = await frontDropZone().count;
  const tagSnap = await guardianSnapLink();
  await t
    .maximizeWindow() // needed to find DOM elements in headless mode
    .setNativeDialogHandler(() => false)
    .dragToElement(tagSnap, frontDropZone(1)) //drag tag into parent position (not a sublink)
    .expect(frontDropZone().count)
    .eql(frontDropsCount + 2) // adding a sublink adds 1 dropzone, adding a normal article adds 2
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
    .eql(frontDropsCount + 2)
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
    .eql(frontDropsCount + 2)
    .expect(frontSnapLink(0).textContent)
    .contains('Business - BBC News');
});

test('Previously', async t => {
  const frontDropsCount = await frontDropZone().count;

  await t
    .expect(previouslyItem().count)
    .eql(0) // toggled closed initally
    .click(previouslyToggle());

  const previouslyDropsCount = await previouslyDropZone().count;
  const previouslyItemCount = await previouslyItem().count;

  await t
    .expect(previouslyDropsCount)
    .eql(0) // no places to drop!
    .dragToElement(previouslyItem(0), frontDropZone(0))
    .wait(1000)
    .expect(frontDropZone().count)
    .eql(frontDropsCount + 2) // clones into the front
    .expect(previouslyItem().count)
    .eql(previouslyItemCount); // does not remove the previously item
});

test('Clipboard - drop depth', async t => {
  const prevCount = await clipboardItem().count;
  await t
    .maximizeWindow()
    // drag to a position in the UI wrapper - NOT the clipboard itself
    // this checks that the clipboard drop area extends to the bottom of the visual clipboard wrapper
    .dragToElement(feedItem(0), clipboardWrapper(), {
      destinationOffsetX: 40,
      destinationOffsetY: -40
    })
    .wait(1000)
    .expect(prevCount + 1)
    .eql(2);
});
