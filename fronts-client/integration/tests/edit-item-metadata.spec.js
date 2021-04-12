import setup from '../server/setup';
import teardown from '../server/teardown';
import {
  clipboardItem,
  clipboardItemHeadline,
  collection,
  card,
  cardHeadline,
  cardKicker,
  cardBreakingNews,
  editFormHeadlineInput,
  editFormSaveButton,
  editFormBreakingNewsToggle,
  collectionDropZone
} from '../selectors';

fixture`Fronts edit`.page`http://localhost:3456/v2/editorial`
  .before(setup)
  .after(teardown);

test('Metadata edits are persisted in collections- headline', async t => {
  const firstCollectionStory = card(0, 0);
  const headlineInput = editFormHeadlineInput();
  await t
    .click(firstCollectionStory)
    .click(headlineInput)
    .selectText(headlineInput)
    .typeText(headlineInput, 'A better headline')
    .click(editFormSaveButton())
    .expect(cardHeadline(0, 0).textContent)
    .eql('A better headline');
});

test('Metadata edits have cleaner rules applied – headline', async t => {
  const firstCollectionStory = card(0, 0);
  const headlineInput = editFormHeadlineInput();
  await t
    .click(firstCollectionStory)
    .click(headlineInput)
    .selectText(headlineInput)
    .typeText(
      headlineInput,
      `Headline "with" a 'quote', and -- dashes ... and ellipsis, and a - hyphen`
    )
    .click(editFormSaveButton())
    .expect(cardHeadline(0, 0).textContent)
    .eql(
      'Headline “with” a ‘quote’, and – dashes … and ellipsis, and a – hyphen'
    );
});

test('Metadata edits are persisted in clipboard - headline', async t => {
  const firstClipboardStory = clipboardItem(0);
  const headlineInput = editFormHeadlineInput();
  await t
    .click(firstClipboardStory)
    .click(headlineInput)
    .selectText(headlineInput)
    .typeText(headlineInput, 'A better headline')
    .click(editFormSaveButton())
    .expect(clipboardItemHeadline(0).textContent)
    .eql('A better headline');
});

test('Metadata edits are persisted in collections- "breaking news" toggle button', async t => {
  const firstCollectionStory = card(0, 0);
  const breakingNewsToggle = editFormBreakingNewsToggle();
  await t
    .click(firstCollectionStory)
    .click(breakingNewsToggle)
    .click(editFormSaveButton())
    .expect(cardBreakingNews(0, 0).textContent)
    .contains(`Breaking news`);
});

test('Metadata edits are persisted in clipboard- "breaking news" toggle button', async t => {
  const firstClipboardStory = clipboardItem(0);
  const breakingNewsToggle = editFormBreakingNewsToggle();
  const firstCollectionFirstDropZone = collectionDropZone(0, 0);
  await t
    .click(firstClipboardStory)
    .click(breakingNewsToggle)
    .click(editFormSaveButton())
    .dragToElement(clipboardItem(0), firstCollectionFirstDropZone) // Kickers are not visible in clipboard, drag to collection to view
    .expect(cardBreakingNews(0, 0).textContent)
    .contains(`Breaking news`);
});
