import setup from '../server/setup';
import teardown from '../server/teardown';
import {
  frontsMenuButton,
  frontsMenuItem,
  prefillButton,
  feedItemHeadline
} from '../selectors';

fixture`Fronts edit`
  .page`http://localhost:3456/v2/issues/fake-edition-isssue-id`
  .before(setup)
  .beforeEach(async t => await t.eval(() => (window.IS_INTEGRATION = true)))
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