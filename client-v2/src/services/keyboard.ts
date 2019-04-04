import { Store, Dispatch, GetState } from 'types/Store';
import {
  editorCloseAllOverviews,
  editorOpenAllOverviews,
  selectIsClipboardOpen,
  editorCloseClipboard,
  editorOpenClipboard
} from 'bundles/frontsUIBundle';
import { State } from 'types/State';
import { ThunkResult } from 'types/Store';
import Mousetrap from 'mousetrap';

export interface KeyboardActionMap {
  [focusable: string]: KeyboardAction;
}

type FocusableTypes = 'clipboard' | 'article';

interface BaseFocusState {
  type: FocusableTypes;
}

export type ApplicationFocusState = BaseFocusState;

// interface ClipboardFocusState extends BaseFocusState {
//   type: 'clipboard';
// }

type KeyboardAction = (focusState: BaseFocusState) => ThunkResult<any>;

interface KeyboardBinding {
  title: string;
  description?: string;
  action: (e: KeyboardEvent) => any;
}

interface KeyboardBindingMap {
  [shortcut: string]: KeyboardBinding;
}

export const createKeyboardActionMap = (store: Store): KeyboardBindingMap => ({
  'command+v': {
    title: 'Paste',
    description: 'Paste an entity',
    action: bindActionMap(store, paste)
  },
  'command+j': {
    title: 'Close all overviews',
    action: () => {
      store.dispatch(editorCloseAllOverviews());
    }
  },
  'command+k': {
    title: 'Open all overviews',
    action: () => {
      store.dispatch(editorOpenAllOverviews());
    }
  },
  'command+u': {
    title: 'Toggle clipboard',
    action: () => {
      if (selectIsClipboardOpen(store.getState())) {
        store.dispatch(editorCloseClipboard());
      } else {
        store.dispatch(editorOpenClipboard());
      }
    }
  }
});

const init = (store: Store) => {
  const keyboardActionMap = createKeyboardActionMap(store);
  applyKeyboardActionMap(keyboardActionMap);
  return keyboardActionMap;
};

const paste: KeyboardActionMap = {
  clipboard: (focusState: BaseFocusState) => (
    dispatch: Dispatch,
    getState: GetState
  ) => {
    // Do something with the clipboard here.
    console.log({ focusState });
  }
};

const selectFocusable = (state: State): BaseFocusState => ({
  type: 'clipboard'
});

const bindActionMap = (store: Store, actionMap: KeyboardActionMap) => {
  return (e: KeyboardEvent) => {
    // Get the focused thing
    const focusable = selectFocusable(store.getState());
    // Action the focused thing
    (store.dispatch as Dispatch)(actionMap[focusable.type](focusable));
  };
};

const applyKeyboardActionMap = (map: KeyboardBindingMap) => {
  const entries = Object.entries(map);

  entries.forEach(([seq, handler]) => Mousetrap.bind(seq, handler.action));
  return () => entries.forEach(([seq]) => Mousetrap.unbind(seq));
};

export default init;
