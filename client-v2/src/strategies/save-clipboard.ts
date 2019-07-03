import { State } from 'types/State';
import { saveClipboard, saveEditionsClipboard } from 'services/faciaApi';
import { runStrategy } from './run-strategy';
import { NestedArticleFragment } from 'shared/types/Collection';

const saveClipboardStrategy = (
  state: State,
  content: NestedArticleFragment[]
) =>
  runStrategy<void>(state, {
    front: () => saveClipboard(content),
    edition: () => saveEditionsClipboard(content),
    none: () => null
  });

export { saveClipboardStrategy };
