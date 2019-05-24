import Raven from 'raven-js';
import { KeyboardActionMap, ApplicationFocusStates } from 'keyboard';
import { Dispatch } from 'types/Store';
import { insertClipboardArticleFragment } from 'actions/Clipboard';
import { createArticleFragment } from 'shared/actions/ArticleFragments';
import { RefDrop } from 'util/collectionUtils';

const paste: KeyboardActionMap = {
  clipboard: (_: ApplicationFocusStates) => async (dispatch: Dispatch) => {
    try {
      if (!navigator || !(navigator as any).clipboard) {
        throw new Error('No navigator available on paste');
      }
      // A temporary any here pending proper typings
      const content: string = await (navigator as any).clipboard.readText();
      if (!content) {
        return;
      }
      const contentData: RefDrop = { type: 'REF', data: content };
      const articleFragment = await dispatch(
        createArticleFragment(contentData)
      );
      if (!articleFragment) {
        return;
      }
      dispatch(
        insertClipboardArticleFragment('clipboard', 0, articleFragment.uuid)
      );
    } catch (e) {
      Raven.captureMessage(`Paste to clipboard failed: ${e.message}`);
    }
  }
};

export default paste;
