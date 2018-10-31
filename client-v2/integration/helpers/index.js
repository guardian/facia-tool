import { Selector } from 'testcafe';
import setup from '../server/setup';
import teardown from '../server/teardown';

const select = str => Selector(`[data-testid=${str}]`);

export { select };
