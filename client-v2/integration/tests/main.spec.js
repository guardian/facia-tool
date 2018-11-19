import setup from '../server/setup';
import teardown from '../server/teardown';
import {
  frontDropZone,
  frontHeadline,
  frontItemAddToClipboardHoverButton,
  feedItem,
  feedItemHeadline,
  feedItemAddToClipboardHoverButton,
  clipboardItemTruncatedHeadline
} from '../selectors';

fixture`Fronts edit`.page`http://localhost:3456/v2/editorial`
  .before(setup)
  .after(teardown);

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
    .expect(frontDropZone().count)
    .eql(frontDropsCount + 2)
    .expect(frontHeadline().textContent)
    .notEql(topFeedHeadline)
    .expect(frontHeadline().textContent)
    .eql(topFrontHeadline);
});

// TODO TestCafe .hover method does not work. Buttons remain hidden, click fails on visibility check.
test.skip('Add to Clipboard hover button', async t => {
  const feedHeadline = await feedItemHeadline(5).textContent;
  const feedHeadlineTruncated = feedHeadline.slice(0, 35);
  const topFrontHeadline = await frontHeadline(0).textContent;
  const topFrontHeadlineTruncated = topFrontHeadline.slice(0, 35);
  await t
    // check feed to clipboard //
    // TODO .hover()
    .click(feedItemAddToClipboardHoverButton(5), { visibilityCheck: false })
    .expect(clipboardItemTruncatedHeadline(0).textContent)
    .contains(feedHeadlineTruncated)
    // check front to clipboard //
    // TODO .hover()
    .click(frontItemAddToClipboardHoverButton(0), { visibilityCheck: false })
    .expect(clipboardItemTruncatedHeadline(0).textContent)
    .contains(topFrontHeadlineTruncated);
});
