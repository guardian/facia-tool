import { Selector } from 'testcafe';

const nestedSelectorString = (...strs) =>
  strs.map(str => `[data-testid="${str}"]`).join(' ');

const select = (...strs) => Selector(nestedSelectorString(...strs));

export { select };
