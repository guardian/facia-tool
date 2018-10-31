import { Selector } from 'testcafe';

const startsWith = str => str.startsWith('^');
const selector = str => str.replace(/\^/g, '');

const nestedSelectorString = (...strs) =>
  strs
    .reduce(
      (acc, str) => [
        ...acc,
        `[data-testid${startsWith(str) ? '^' : ''}="${selector(str)}"]`
      ],
      []
    )
    .join(' ');

const select = (...strs) => Selector(nestedSelectorString(...strs));

export { select };
