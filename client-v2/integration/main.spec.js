import { select } from './helpers';
import setup from './server/setup';
import teardown from './server/teardown';

fixture`Fronts edit`.page`http://localhost:3456/v2/editorial`
  .before(setup)
  .after(teardown);

test('Drag and drop', async t =>
  await t
    .setTestSpeed(0.5)
    .dragToElement(select('feed-item'), select('drop-zone'))
    .wait(1000)
    .expect(select('drop-zone').count)
    .eql(11));
