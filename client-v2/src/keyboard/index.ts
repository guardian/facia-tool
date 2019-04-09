import { Store, Dispatch } from 'types/Store';
import {
  editorCloseAllOverviews,
  editorOpenAllOverviews,
  selectIsClipboardOpen,
  editorCloseClipboard,
  editorOpenClipboard
} from 'bundles/frontsUIBundle';
import { ThunkResult } from 'types/Store';
import Mousetrap from 'mousetrap';
import { selectFocusState, setFocusState } from 'bundles/focusBundle';
import paste from './keyboardActionMaps/paste';
import { moveUp, moveDown } from './keyboardActionMaps/move';
import { ArticleFragment } from '../shared/types/Collection';

type FocusableTypes =
  | 'clipboard'
  | 'clipboardArticle'
  | 'collection'
  | 'collectionArticle';

interface BaseFocusState {
  type: FocusableTypes;
  articleFragment?: ArticleFragment;
  collectionId?: string;
}

export type ApplicationFocusStates = BaseFocusState;

/**
 * A map from a focusable type to an action. Used to determine which action to
 * trigger for a given focus state.
 */
export interface KeyboardActionMap {
  [type: string]: KeyboardAction;
}

type KeyboardAction = (focusState: BaseFocusState) => ThunkResult<any>;

interface KeyboardBinding {
  title: string;
  description?: string;
  action: (e: KeyboardEvent) => void;
}

interface KeyboardBindingMap {
  [shortcut: string]: KeyboardBinding;
}

export const createKeyboardActionMap = (store: Store): KeyboardBindingMap => ({
  up: {
    title: 'Up',
    description: 'Move an entity up',
    action: bindActionMap(store, moveUp)
  },
  down: {
    title: 'Down',
    description: 'Move an entity down',
    action: bindActionMap(store, moveDown)
  },
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
  },
  'command+b': {
    title: 'Focus clipboard',
    action: () => {
      if (selectIsClipboardOpen(store.getState())) {
        store.dispatch(
          setFocusState({
            type: 'clipboard'
          })
        );
      }
    }
  }
});

/**
 * Bind a keyboard action map to a store, returning a closure that will call the
 * appropriate action given the application focus state.
 */
const bindActionMap = (store: Store, actionMap: KeyboardActionMap) => {
  return () => {
    const focusable = selectFocusState(store.getState());
    if (!focusable) {
      return;
    }
    (store.dispatch as Dispatch)(actionMap[focusable.type](focusable));
  };
};

const applyKeyboardActionMap = (map: KeyboardBindingMap) => {
  const entries = Object.entries(map);

  entries.forEach(([seq, handler]) => Mousetrap.bind(seq, handler.action));
  return () => entries.forEach(([seq]) => Mousetrap.unbind(seq));
};

export const listenForKeyboardEvents = (store: Store) => {
  const keyboardActionMap = createKeyboardActionMap(store);
  const unbind = applyKeyboardActionMap(keyboardActionMap);
  return { keyboardActionMap, unbind };
};
