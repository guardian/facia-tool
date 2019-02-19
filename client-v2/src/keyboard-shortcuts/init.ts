import { Store } from 'types/Store';
import {
  editorCloseAllOverviews,
  editorOpenAllOverviews,
  selectIsClipboardOpen,
  editorCloseClipboard,
  editorOpenClipboard
} from 'bundles/frontsUIBundle';
import { trap } from './trap';

const createTrapMap = (store: Store) => ({
  'command+j': () => {
    store.dispatch(editorCloseAllOverviews());
  },
  'command+k': () => {
    store.dispatch(editorOpenAllOverviews());
  },
  'command+u': () => {
    if (selectIsClipboardOpen(store.getState())) {
      store.dispatch(editorCloseClipboard());
    } else {
      store.dispatch(editorOpenClipboard());
    }
  }
});

const init = (store: Store) => trap(createTrapMap(store));

export { init };
