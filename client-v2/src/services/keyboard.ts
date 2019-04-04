import { Store, Dispatch, GetState } from 'types/Store';
import { trap } from 'util/trap';
import {
  editorCloseAllOverviews,
  editorOpenAllOverviews,
  selectIsClipboardOpen,
  editorCloseClipboard,
  editorOpenClipboard
} from 'bundles/frontsUIBundle';
import { State } from 'types/State';

interface ActionMap {
  [focusable: string]: Action;
}

type FocusableTypes = 'clipboard' | 'article';

interface BaseFocusState {
  type: FocusableTypes;
}

interface ClipboardFocusState extends BaseFocusState {
  type: 'clipboard';
}

type Action = any;

const init = (store: Store) =>
  trap({
    'command+v': bindActionMap(store, paste),
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

const paste: ActionMap = {
  clipboard: (focusable: ClipboardFocusState) => (
    dispatch: Dispatch,
    getState: GetState
  ) => {
    // Do something with the clipboard here.
    console.log({ focusable });
  }
};

const selectFocusable = (state: State) => 'clipboard';

const bindActionMap = (store: Store, actionMap: ActionMap) => {
  return (e: KeyboardEvent) => {
    // Get the focused thing
    const focusable = selectFocusable(store.getState());
    // Action the focused thing
    store.dispatch(actionMap[focusable](focusable));
  };
};

export default init;
