import {
  insertGroupArticleFragment,
  insertSupportingArticleFragment,
  removeGroupArticleFragment,
  removeSupportingArticleFragment,
  updateArticleFragmentMeta,
  createArticleFragment,
  articleFragmentsReceived
} from 'shared/actions/ArticleFragments';
import { ArticleFragment } from 'shared/types/Collection';
import {
  selectSharedState,
  articleFragmentsSelector
} from 'shared/selectors/shared';
import { ThunkResult, Dispatch } from 'types/Store';
import { addPersistMetaToAction } from 'util/storeMiddleware';
import { cloneFragment } from 'shared/util/articleFragment';
import { PosSpec } from 'lib/dnd';
import { Action } from 'types/Action';
import {
  insertClipboardArticleFragment,
  removeClipboardArticleFragment
} from './Clipboard';

type InsertActionCreator = (
  id: string,
  index: number,
  articleFragmentId: string
) => Action;

const getInsertionActionCreatorFromType = (
  type: string,
  persistTo?: 'collection' | 'clipboard'
) => {
  const actionMap: { [type: string]: InsertActionCreator | undefined } = {
    articleFragment: insertSupportingArticleFragment,
    group: insertGroupArticleFragment,
    clipboard: insertClipboardArticleFragment
  };

  const actionCreator = actionMap[type] || null;

  return actionCreator && persistTo
    ? addPersistMetaToAction(actionCreator, {
        persistTo,
        key: 'articleFragmentId'
      })
    : actionCreator;
};

type RemoveActionCreator = (id: string, articleFragmentId: string) => Action;

const getRemoveActionCreatorFromType = (
  type: string,
  persistTo?: 'collection' | 'clipboard'
) => {
  const actionMap: { [type: string]: RemoveActionCreator | undefined } = {
    articleFragment: removeSupportingArticleFragment,
    group: removeGroupArticleFragment,
    clipboard: removeClipboardArticleFragment
  };

  const actionCreator = actionMap[type] || null;

  return actionCreator && persistTo
    ? addPersistMetaToAction(actionCreator, {
        persistTo,
        key: 'articleFragmentId'
      })
    : actionCreator;
};

const updateArticleFragmentMetaWithPersist = addPersistMetaToAction(
  updateArticleFragmentMeta,
  {
    persistTo: 'collection'
  }
);

const updateClipboardArticleFragmentMetaWithPersist = addPersistMetaToAction(
  updateArticleFragmentMeta,
  {
    persistTo: 'clipboard'
  }
);

const insertArticleFragmentWithCreate = (
  to: PosSpec,
  id: string,
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch) => {
    const insertActionCreator = getInsertionActionCreatorFromType(
      to.type,
      persistTo
    );
    if (!insertActionCreator) {
      return;
    }
    dispatch(createArticleFragment(id))
      .then(fragment => {
        if (fragment) {
          dispatch(insertActionCreator(to.id, to.index, fragment.uuid));
        }
      })
      .catch(() => {
        // @todo: implement once error handling is done
      });
  };
};

const removeArticleFragment = (
  type: string,
  id: string,
  articleFragmentId: string,
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch) => {
    const removeActionCreator = getRemoveActionCreatorFromType(type, persistTo);
    if (!removeActionCreator) {
      return;
    }
    dispatch(removeActionCreator(id, articleFragmentId));
  };
};

const moveArticleFragment = (
  to: PosSpec,
  fragment: ArticleFragment,
  from: PosSpec | null,
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
    const removeActionCreator =
      from && getRemoveActionCreatorFromType(from.type);
    const insertActionCreator = getInsertionActionCreatorFromType(
      to.type,
      persistTo
    );

    if (!insertActionCreator || (!removeActionCreator && from)) {
      return;
    }

    // if from is not null then assume we're copying a moved article fragment
    // into this new position
    const { parent, supporting } = !from
      ? cloneFragment(
          fragment,
          articleFragmentsSelector(selectSharedState(getState()))
        )
      : { parent: fragment, supporting: [] };

    if (!from) {
      dispatch(articleFragmentsReceived([parent, ...supporting]));
    } else {
      dispatch((removeActionCreator as RemoveActionCreator)(from.id, fragment.uuid));
    }

    dispatch(insertActionCreator(to.id, to.index, parent.uuid));
  };
};

export {
  insertArticleFragmentWithCreate as insertArticleFragment,
  moveArticleFragment,
  updateArticleFragmentMetaWithPersist as updateArticleFragmentMeta,
  updateClipboardArticleFragmentMetaWithPersist as updateClipboardArticleFragmentMeta,
  removeArticleFragment
};
