import { ClientFunction } from 'testcafe';
import setup from '../server/setup';
import teardown from '../server/teardown';
import {
  collection,
  card,
  cardHeadline,
  editFormHeadlineInput,
  editFormSaveButton,
  editFormRichText,
  editFormBoldButton,
  editFormAddLinkButton,
  editFormRemoveLinkButton
} from '../selectors';

fixture`Fronts edit`.page`http://localhost:3456/v2/email`
  .before(setup)
  .after(teardown);

test('Rich text editor bolds text', async t => {
  const firstCollectionStory1 = card(0, 0);
  const richTextInput = editFormRichText();
  const cardHeadlineRT = await cardHeadline(0, 0);

  const getCardHeadlineHtml = ClientFunction(() => cardHeadlineRT().innerHTML, {
    dependencies: { cardHeadlineRT }
  });

  await t
    .click(firstCollectionStory1)
    .click(richTextInput)
    .selectText(richTextInput)
    .click(editFormBoldButton())
    .wait(300)
    .click(editFormSaveButton())
    .expect(getCardHeadlineHtml())
    .eql('<p><strong>Test2</strong></p>');
});

// changing this headline: '<p><strong><a href="https://bbc.co.uk/">Bold with a link Test3</a></strong></p>',
test('Rich text editor removes bold from bold text', async t => {
  const secondCollectionStory1 = card(1, 0);
  const richTextInput = editFormRichText();
  const cardHeadlineRT = await cardHeadline(1, 0);

  const getCardHeadlineHtml = ClientFunction(() => cardHeadlineRT().innerHTML, {
    dependencies: { cardHeadlineRT }
  });

  await t
    .click(secondCollectionStory1)
    .click(richTextInput)
    .selectText(richTextInput)
    .click(editFormBoldButton())
    .wait(300)
    .click(editFormSaveButton())
    .expect(getCardHeadlineHtml())
    .eql('<p><a href="https://bbc.co.uk/">Bold with a link Test3</a></p>');
});

test('Rich text editor adds a link to text', async t => {
  const secondCollectionStory1 = card(0, 0);
  const richTextInput = editFormRichText();
  const cardHeadlineRT = await cardHeadline(0, 0);

  const getCardHeadlineHtml = ClientFunction(() => cardHeadlineRT().innerHTML, {
    dependencies: { cardHeadlineRT }
  });

  await t
    .click(secondCollectionStory1)
    .click(richTextInput)
    .selectText(richTextInput)
    .setNativeDialogHandler(() => 'https://bbc.co.uk')
    .click(editFormAddLinkButton())
    .wait(300)
    .click(editFormSaveButton())
    .expect(getCardHeadlineHtml())
    .eql('<p><a href="https://bbc.co.uk/">Test2</a></p>');
});

// changing this headline: '<p><strong><a href="https://bbc.co.uk/">Bold with a link Test3</a></strong></p>',
test('Rich text editor removes a link from text', async t => {
  const secondCollectionStory1 = card(1, 0);
  const richTextInput = editFormRichText();
  const cardHeadlineRT = await cardHeadline(1, 0);

  const getCardHeadlineHtml = ClientFunction(() => cardHeadlineRT().innerHTML, {
    dependencies: { cardHeadlineRT }
  });

  await t
    .click(secondCollectionStory1)
    .click(richTextInput)
    .selectText(richTextInput)
    .click(editFormRemoveLinkButton())
    .wait(300)
    .click(editFormSaveButton())
    .expect(getCardHeadlineHtml())
    .eql('<p><strong>Bold with a link Test3</strong></p>');
});
