import {
  insertGroupArticleFragment,
  insertSupportingArticleFragment,
  removeGroupArticleFragment,
  removeSupportingArticleFragment,
  updateArticleFragmentMeta,
  createArticleFragment,
  articleFragmentsReceived,
  maybeAddFrontPublicationDate,
  copyArticleFragmentImageMeta
} from 'shared/actions/ArticleFragments';
import { ArticleFragment } from 'shared/types/Collection';
import {
  selectSharedState,
  articleFragmentsSelector,
  articleFragmentSelector,
  articleGroupSelector
} from 'shared/selectors/shared';
import { ThunkResult, Dispatch } from 'types/Store';
import { addPersistMetaToAction } from 'util/storeMiddleware';
import { cloneFragment } from 'shared/util/articleFragment';
import {
  getFromGroupIndicesWithRespectToState,
  getToGroupIndicesWithRespectToState
} from 'util/moveUtils';
import { PosSpec } from 'lib/dnd';
import { Action } from 'types/Action';
import {
  insertClipboardArticleFragment,
  removeClipboardArticleFragment
} from './Clipboard';
import { State } from 'types/State';
import { startConfirmModal } from './ConfirmModal';
import { capGroupSiblings } from 'shared/actions/Groups';
import { collectionCapSelector } from 'selectors/configSelectors';
import { getImageMetaFromValidationResponse } from 'util/form';
import { ValidationResponse } from 'shared/util/validateImageSrc';
import { MappableDropType } from 'util/collectionUtils';
import { willCollectionHitCollectionCapSelector } from 'selectors/collectionSelectors';
import { batchActions } from 'redux-batched-actions';

type InsertActionCreator = (
  id: string,
  index: number,
  articleFragmentId: string
) => Action;

type InsertThunkActionCreator = (
  persistTo: 'collection' | 'clipboard'
) => (
  id: string,
  index: number,
  articleFragmentId: string,
  removeAction: Action | null
) => ThunkResult<void>;

// Creates a thunk action creator from a plain action creator that also allows
// passing a persistence location
// we need to create thunks for these to help TS as we may be dispatching either
// an Action or a ThunkAction in some cases. The redux-thunk types don't support
// this so we can make a thunk instead
// the persistence stuff needs to be dynamic as we sometimes need to insert an
// article fragment and save to clipboard and sometimes save to collection
// depending on the location of that articlefragment
const createInsertArticleFragmentThunk = (action: InsertActionCreator) => (
  persistTo: 'collection' | 'clipboard'
) => (
  id: string,
  index: number,
  articleFragmentId: string,
  removeAction: Action | null
) => (dispatch: Dispatch) => {
  if (removeAction) {
    dispatch(removeAction);
  }
  dispatch(
    addPersistMetaToAction(action, {
      persistTo,
      key: 'articleFragmentId'
    })(id, index, articleFragmentId)
  );
};

const copyArticleFragmentImageMetaWithPersist = addPersistMetaToAction(
  copyArticleFragmentImageMeta,
  {
    persistTo: 'collection',
    key: 'to'
  }
);

// Creates a thunk with persistence that will launch a confirm modal if required
// when adding to a group, otherwise will just run the action
// the confirm modal links to the collection caps
const maybeInsertGroupArticleFragment = (
  persistTo: 'collection' | 'clipboard'
) => (
  id: string,
  index: number,
  articleFragmentId: string,
  removeAction: Action | null
) => {
  return (dispatch: Dispatch, getState: () => State) => {
    // require a modal!
    const state = getState();

    const collectionCap = collectionCapSelector(state);

    const willCollectionHitCollectionCap = willCollectionHitCollectionCapSelector(
      state,
      id,
      index,
      articleFragmentId,
      collectionCap
    );

    if (willCollectionHitCollectionCap) {
      // if there are too many fragments now then launch a modal to ask the user
      // what action to take
      dispatch(
        startConfirmModal(
          'Collection limit',
          `You can have a maximum of ${collectionCap} articles in a collection.
          You can proceed, and the last article in the collection will be
          removed automatically, or you can cancel and remove articles from the
          collection yourself.`,
          // if the user accepts then remove the moved item (if there was one),
          // remove article fragments past the cap count and finally persist
          (removeAction ? [removeAction] : []).concat([
            insertGroupArticleFragment(id, index, articleFragmentId),
            maybeAddFrontPublicationDate(articleFragmentId),
            addPersistMetaToAction(capGroupSiblings, {
              id: articleFragmentId,
              persistTo,
              applyBeforeReducer: true
            })(id, collectionCap)
          ]),
          // otherwise do nothing
          []
        )
      );
    } else {
      // if we're not going over the cap then just remove a moved article if
      // needed and insert the new article
      dispatch(
        batchActions(
          (removeAction ? [removeAction] : []).concat([
            maybeAddFrontPublicationDate(articleFragmentId),
            addPersistMetaToAction(insertGroupArticleFragment, {
              key: 'articleFragmentId',
              persistTo
            })(id, index, articleFragmentId)
          ])
        )
      );
    }
  };
};

// This maps a type string such as `clipboard` to an insert action creator and
// if persistTo is passed then the action creator will add persist meta
// these are expected to be thunks that can be passed actions to run if an
// insert was possible
const getInsertionActionCreatorFromType = (
  type: string,
  persistTo: 'collection' | 'clipboard'
) => {
  const actionMap: { [type: string]: InsertThunkActionCreator | undefined } = {
    articleFragment: createInsertArticleFragmentThunk(
      insertSupportingArticleFragment
    ),
    group: maybeInsertGroupArticleFragment,
    clipboard: createInsertArticleFragmentThunk(insertClipboardArticleFragment)
  };

  const actionCreator = actionMap[type] || null;

  // partially apply the action creator with it's persist logic
  return actionCreator && actionCreator(persistTo);
};

type RemoveActionCreator = (id: string, articleFragmentId: string) => Action;

// this maps a type string such as `group` to a remove action creator and if
// persistTo is passed then add persist meta
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
        key: 'articleFragmentId',
        applyBeforeReducer: true
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
  drop: MappableDropType,
  persistTo: 'collection' | 'clipboard',
  // allow the factory to be injected for testing
  articleFragmentFactory = createArticleFragment
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
    const insertActionCreator = getInsertionActionCreatorFromType(
      to.type,
      persistTo
    );
    if (!insertActionCreator) {
      return;
    }
    const sharedState = selectSharedState(getState());
    const toWithRespectToState = getToGroupIndicesWithRespectToState(
      to,
      sharedState,
      false
    );
    if (toWithRespectToState) {
      return dispatch(articleFragmentFactory(drop))
        .then(fragment => {
          if (fragment) {
            dispatch(
              insertActionCreator(
                toWithRespectToState.id,
                toWithRespectToState.index,
                fragment.uuid,
                null
              )
            );
          }
        })
        .catch(() => {
          // @todo: implement once error handling is done
        });
    }
  };
};

const removeArticleFragment = (
  type: string,
  id: string,
  articleFragmentId: string,
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
    const getGroupIdFromState = () => {
      if (persistTo === 'clipboard') {
        return 'clipboard';
      }
      // The article fragment may belong to an orphaned group -
      // we need to find the actual group the article fragment belongs to
      const idFromState = articleGroupSelector(
        selectSharedState(getState()),
        id,
        articleFragmentId
      );
      if (idFromState) {
        return idFromState;
      }
      // If we could not find a group id the article fragment belongs to
      // then this article is a sublink and we don't have to adjust the id
      return id;
    };
    const groupIdFromState = getGroupIdFromState();
    const removeActionCreator = getRemoveActionCreatorFromType(type, persistTo);
    if (!removeActionCreator) {
      return;
    }
    dispatch(removeActionCreator(groupIdFromState, articleFragmentId));
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
      from && getRemoveActionCreatorFromType(from.type, persistTo);
    const insertActionCreator = getInsertionActionCreatorFromType(
      to.type,
      persistTo
    );

    if (!insertActionCreator) {
      return;
    }

    const sharedState = selectSharedState(getState());

    // If move actions are happening to/from groups which have article fragments displayed
    // in them which don't belong to these groups we need to adjust the indices of the move
    // actions in these groups.
    const fromDetails: {
      fromWithRespectToState: PosSpec | null;
      fromOrphanedGroup: boolean;
    } = getFromGroupIndicesWithRespectToState(from, sharedState);

    const toWithRespectToState: PosSpec | null = getToGroupIndicesWithRespectToState(
      to,
      sharedState,
      fromDetails.fromOrphanedGroup
    );
    if (toWithRespectToState) {
      const { fromWithRespectToState } = fromDetails;

      // if from is not null then assume we're copying a moved article fragment
      // into this new position
      const { parent, supporting } = !fromWithRespectToState
        ? cloneFragment(fragment, articleFragmentsSelector(sharedState))
        : { parent: fragment, supporting: [] };

      if (toWithRespectToState) {
        if (!fromWithRespectToState) {
          dispatch(articleFragmentsReceived([parent, ...supporting]));
        }

        dispatch(
          insertActionCreator(
            toWithRespectToState.id,
            toWithRespectToState.index,
            parent.uuid,
            fromWithRespectToState && removeActionCreator
              ? removeActionCreator(fromWithRespectToState.id, fragment.uuid)
              : null
          )
        );
      }
    }
  };
};

const cloneArticleFragmentToTarget = (
  uuid: string,
  toType: 'clipboard' | 'collection'
): ThunkResult<void> => {
  return (dispatch, getState) => {
    const to = { id: toType, type: toType, index: 0 };
    const fragment = articleFragmentSelector(
      selectSharedState(getState()),
      uuid
    );
    const from = null;
    dispatch(moveArticleFragment(to, fragment, from, toType));
  };
};

const addImageToArticleFragment = (
  uuid: string,
  imageData: ValidationResponse
) =>
  updateArticleFragmentMeta(
    uuid,
    {
      ...getImageMetaFromValidationResponse(imageData),
      imageReplace: true,
      imageCutoutReplace: false,
      imageSlideshowReplace: false
    },
    true
  );

export {
  insertArticleFragmentWithCreate as insertArticleFragment,
  moveArticleFragment,
  updateArticleFragmentMetaWithPersist as updateArticleFragmentMeta,
  updateClipboardArticleFragmentMetaWithPersist as updateClipboardArticleFragmentMeta,
  removeArticleFragment,
  addImageToArticleFragment,
  copyArticleFragmentImageMetaWithPersist,
  cloneArticleFragmentToTarget
};
