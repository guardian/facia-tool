import {
  insertArticleFragment,
  removeArticleFragment,
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
import { InsertArticleFragment } from 'shared/types/Action';
import { cloneFragment } from 'shared/util/articleFragment';

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

const removeArticleFragmentWithPersist = (
  persistTo: 'collection' | 'clipboard'
) =>
  addPersistMetaToAction(removeArticleFragment, {
    persistTo,
    applyBeforeReducer: true,
    key: 'articleFragmentId'
  });

const insertArticleFragmentWithPersist = (
  persistTo: 'collection' | 'clipboard'
) =>
  addPersistMetaToAction(insertArticleFragment, {
    persistTo,
    key: 'articleFragmentId'
  });

const insertArticleFragmentWithCreate = (
  to: InsertArticleFragment['payload']['to'],
  id: InsertArticleFragment['payload']['id'],
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
    dispatch(createArticleFragment(id))
      .then(fragment => {
        if (fragment) {
          dispatch(
            insertArticleFragmentWithPersist(persistTo)(
              to,
              id,
              null,
              articleFragmentsSelector(selectSharedState(getState()))
            )
          );
        }
      })
      .catch(() => {
        // @todo: implement once error handling is done
      });
  };
};

const moveArticleFragment = (
  to: InsertArticleFragment['payload']['to'],
  fragment: ArticleFragment,
  from: InsertArticleFragment['payload']['from'],
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
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
    }

    dispatch(
      insertArticleFragmentWithPersist(persistTo)(
        to,
        parent.uuid,
        from,
        articleFragmentsSelector(selectSharedState(getState()))
      )
    );
  };
};

const insertClipboardArticleFragmentWithPersist = addPersistMetaToAction(
  insertArticleFragment,
  {
    persistTo: 'clipboard',
    key: 'articleFragmentId'
  }
);

export {
  insertArticleFragmentWithCreate as insertArticleFragment,
  moveArticleFragment,
  insertClipboardArticleFragmentWithPersist as insertClipboardArticleFragment,
  updateArticleFragmentMetaWithPersist as updateArticleFragmentMeta,
  updateClipboardArticleFragmentMetaWithPersist as updateClipboardArticleFragmentMeta,
  removeArticleFragmentWithPersist as removeArticleFragment
};
