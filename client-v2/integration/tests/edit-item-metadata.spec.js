import setup from '../server/setup';
import teardown from '../server/teardown';
import {
  clipboardItem,
  clipboardItemHeadline,
  collection,
  collectionItem,
  collectionItemHeadline,
  collectionItemKicker,
  editFormHeadlineInput,
  editFormSaveButton,
  editFormBreakingNewsToggle,
  collectionDropZone
} from '../selectors';

fixture`Fronts edit`.page`http://localhost:3456/v2/editorial`
  .before(setup)
  .beforeEach(async t => await t.eval(() => (window.IS_INTEGRATION = true)))
  .after(teardown);

// ? Why can the headline input be defined ahead of the test but not the save button?
test('Metadata edits are persisted in collections- headline', async t => {
  const firstCollectionStory = await collectionItem(0, 0);
  const headlineInput = await editFormHeadlineInput();
  await t
    .click(firstCollectionStory)
    .click(headlineInput)
    .selectText(headlineInput)
    .typeText(headlineInput, 'A better headline')
    .click(editFormSaveButton())
    .expect(collectionItemHeadline(0, 0).textContent)
    .eql('A better headline');
});

test('Metadata edits are persisted in clipboard - headline', async t => {
  const firstClipboardStory = await clipboardItem(0);
  const headlineInput = await editFormHeadlineInput();
  await t
    .click(firstClipboardStory)
    .click(headlineInput)
    .selectText(headlineInput)
    .typeText(headlineInput, 'A better headline')
    .click(editFormSaveButton())
    .expect(clipboardItemHeadline(0).textContent)
    .eql('A better headline');
});

test.only('Metadata edits are persisted in collections- "breaking news" toggle button', async t => {
  const firstCollectionStory = await collectionItem(0, 0);
  const breakingNewsToggle = await editFormBreakingNewsToggle();
  await t
    .click(firstCollectionStory)
    .click(breakingNewsToggle)
    .click(editFormSaveButton())
    .expect(collectionItemKicker(0, 0).textContent)
    .eql(`Breaking news`);
});

test.only('Metadata edits are persisted in clipboard- "breaking news" toggle button', async t => {
  const firstClipboardStory = await clipboardItem(0);
  const breakingNewsToggle = await editFormBreakingNewsToggle();
  const firstCollectionFirstDropZone = await collectionDropZone(0, 0);
  await t
    .click(firstClipboardStory)
    .click(breakingNewsToggle)
    .click(editFormSaveButton())
    .dragToElement(clipboardItem(0), firstCollectionFirstDropZone) // Kickers are not visible in clipboard, drag to collection to view
    .expect(collectionItemKicker(0, 0).textContent)
    .eql(`Breaking news`);
});
