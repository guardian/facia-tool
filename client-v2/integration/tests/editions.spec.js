import setup from '../server/setup';
import teardown from '../server/teardown';
import {
  frontsMenuButton,
  frontsMenuItem,
  prefillButton,
  feedItemHeadline,
  frontName,
  renameFrontButton,
  renameFrontInput,
  publishEditionButton,
  confirmModal
} from '../selectors';

fixture`Fronts edit`
  .page`http://localhost:3456/v2/issues/fake-edition-isssue-id`
  .before(setup)
  .after(teardown);

test('Only show prefill button when prefill query is defined', async t => {
  await t
    .click(frontsMenuButton())
    .click(frontsMenuItem(0))
    .expect(prefillButton().count)
    .eql(1);
});

test('Check prefill button renders searches properly.', async t => {
  await t
    .click(frontsMenuButton())
    .click(frontsMenuItem(0))
    .click(prefillButton(0))
    .expect(feedItemHeadline(0).textContent)
    .eql('Iran stokes Gulf tensions by seizing two British-linked oil tankers');
});

test('Check renaming a front works', async t => {
  await t
    .click(frontsMenuButton())
    .click(frontsMenuItem(1))
    .expect(frontName(0).textContent)
    .eql('Special 1')
    .click(renameFrontButton(0))
    .selectText(renameFrontInput())
    .typeText(renameFrontInput(), 'Super neat custom front name')
    .pressKey('enter')
    .expect(frontName(0).textContent)
    .eql('Super neat custom front name');
});

test('Check publish edition button opens modal', async t => {
  await t
    .click(publishEditionButton())
    .expect(confirmModal().exists)
    .ok();
});
