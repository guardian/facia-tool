import { select } from './helpers';
import setup from './server/setup';
import teardown from './server/teardown';

fixture`Fronts edit`.page`http://localhost:3456/v2/editorial`
  .before(setup)
  .after(teardown);

test('Drag and drop', async t => {
  const topClipHeadline = await select('rich/debug', 'headline').textContent;
  const topFeedHeadline = await select('feed-item', 'headline').textContent;
  const frontDropsCount = await select('rich/debug', '^drop-zone').count;
  await t
    .setTestSpeed(0.5)
    .dragToElement(select('feed-item'), select('rich/debug', 'drop-zone:0'))
    .wait(1000)
    .expect(select('rich/debug', '^drop-zone').count)
    .eql(frontDropsCount + 2)
    .expect(select('rich/debug', 'headline').textContent)
    .notEql(topClipHeadline)
    .expect(select('rich/debug', 'headline').textContent)
    .eql(topFeedHeadline);
});
