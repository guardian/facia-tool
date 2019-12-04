import { ClientFunction } from 'testcafe';
import setup from '../server/setup';
import teardown from '../server/teardown';
import {
  collection,
  card,
  snap,
  cardHeadline,
  snapHeadline,
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
  const htmlSnapCard = snap(2, 0);
  const richTextInput = editFormRichText();
  const snapHeadlineRT = await snapHeadline(2, 0);

  const getSnapHeadlineHtml = ClientFunction(() => snapHeadlineRT().innerHTML, {
    dependencies: { snapHeadlineRT }
  });

  await t
    .click(htmlSnapCard)
    .click(richTextInput)
    .selectText(richTextInput)
    .click(editFormBoldButton())
    .wait(300)
    .click(editFormSaveButton())
    .expect(getSnapHeadlineHtml())
    .eql('<strong>Test2</strong>');
});

// changing this headline: '<strong><a href="https://bbc.co.uk/">Bold with a link Test3</a></strong>',
test('Rich text editor removes bold from bold text', async t => {
  const secondCollectionStory1 = snap(2, 1);
  const richTextInput = editFormRichText();
  const snapHeadlineRT = await snapHeadline(2, 1);

  const getSnapHeadlineHtml = ClientFunction(() => snapHeadlineRT().innerHTML, {
    dependencies: { snapHeadlineRT }
  });

  await t
    .click(secondCollectionStory1)
    .click(richTextInput)
    .selectText(richTextInput)
    .click(editFormBoldButton())
    .wait(300)
    .click(editFormSaveButton())
    .expect(getSnapHeadlineHtml())
    .eql('<a href="https://bbc.co.uk/">Bold with a link Test3</a>');
});

test('Rich text editor adds a link to text', async t => {
  const secondCollectionStory1 = snap(2, 0);
  const richTextInput = editFormRichText();
  const snapHeadlineRT = await snapHeadline(2, 0);

  const getSnapHeadlineHtml = ClientFunction(() => snapHeadlineRT().innerHTML, {
    dependencies: { snapHeadlineRT }
  });

  await t
    .click(secondCollectionStory1)
    .click(richTextInput)
    .selectText(richTextInput)
    .setNativeDialogHandler(() => 'https://bbc.co.uk')
    .click(editFormAddLinkButton())
    .wait(300)
    .click(editFormSaveButton())
    .expect(getSnapHeadlineHtml())
    .eql('<a href="https://bbc.co.uk/">Test2</a>');
});

// changing this headline: '<strong><a href="https://bbc.co.uk/">Bold with a link Test3</a></strong>',
test('Rich text editor removes a link from text', async t => {
  const secondCollectionStory1 = snap(2, 1);
  const richTextInput = editFormRichText();
  const snapHeadlineRT = await snapHeadline(2, 1);

  const getSnapHeadlineHtml = ClientFunction(() => snapHeadlineRT().innerHTML, {
    dependencies: { snapHeadlineRT }
  });

  await t
    .click(secondCollectionStory1)
    .click(richTextInput)
    .selectText(richTextInput)
    .click(editFormRemoveLinkButton())
    .wait(300)
    .click(editFormSaveButton())
    .expect(getSnapHeadlineHtml())
    .eql('<strong>Bold with a link Test3</strong>');
});
