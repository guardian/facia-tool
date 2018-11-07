import React from 'react';
import { getIdFromURL } from 'util/CAPIUtils';
import { ThunkResult } from 'types/Store';
import { Dispatch } from 'types/Store';
import { Move, PosSpec } from 'lib/dnd';
import { ArticleFragment } from 'shared/types/Collection';
import { addArticleFragment } from 'shared/actions/ArticleFragments';
import { insertClipboardArticleFragment } from 'actions/ArticleFragments';
import {
  articleFragmentSelector,
  selectSharedState
} from 'shared/selectors/shared';

const dropToArticle = (e: React.DragEvent): string | null => {
  const map = {
    text: getIdFromURL,
    capi: (data: string) => data
  };

  for (const [type, fn] of Object.entries(map)) {
    const data = e.dataTransfer.getData(type);
    if (data) {
      return fn(data);
    }
  }

  return null;
};

type MoveActionCreator = (
  fromType: string,
  fromId: string,
  id: string,
  toType: string,
  toId: string,
  toIndex: number
) => ThunkResult<void>;

type InsertActionCreator = (
  toType: string,
  toId: string,
  fragment: ArticleFragment,
  toIndex: number
) => ThunkResult<void>;

const handleMove = (
  moveActionCreator: MoveActionCreator,
  insertActionCreator: InsertActionCreator,
  dispatch: Dispatch,
  move: Move<ArticleFragment>
) => {
  if (move.from) {
    dispatch(
      moveActionCreator(
        move.from.type,
        move.from.id,
        move.data.uuid,
        move.to.type,
        move.to.id,
        move.to.index
      )
    );
  } else {
    dispatch(
      insertActionCreator(
        move.to.type, // the name of the level above
        move.to.id,
        move.data,
        move.to.index
      )
    );
  }
};

// Inserts from FeedItem and dragEvents have internal ID (eg. 'internal-code/page/4784278' ) not UUID
const handleInsert = (
  id: string,
  insertActionCreator: InsertActionCreator,
  internalID?: boolean, // must be true for inserts from Events or Feed
  to?: PosSpec // only needed for DND events - handleInsertFromEvent,
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
    const dispatchInsert = (uuid: string, fragment?: ArticleFragment) => {
      if (to && fragment) {
        return dispatch(
          insertActionCreator(
            to.type, // the name of the level above
            to.id,
            fragment,
            to.index
          )
        );
      } else {
        return dispatch(
          insertActionCreator(
            'clipboard', // type: collection or clipboard
            'clipboard', // collection id
            articleFragmentSelector(selectSharedState(getState()), uuid),
            0 // index
          )
        );
      }
    };

    if (internalID) {
      dispatch(addArticleFragment(id))
        .then(fragment => {
          if (fragment) {
            dispatchInsert(fragment.uuid, fragment);
          }
        })
        .catch(() => {
          // @todo: implement once error handling is done
        });
    } else {
      dispatchInsert(id);
    }
  };
};

const handleInsertFromEvent = (
  e: React.DragEvent,
  insertActionCreator: InsertActionCreator,
  dispatch: Dispatch,
  to: PosSpec
) => {
  const id = dropToArticle(e);
  if (!id) {
    return;
  }
  dispatch(handleInsert(id, insertActionCreator, true, to));
};

// @todo can this be refactored into handleInsert?
const handleClipboardInsert = (id: string): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) =>
    // @todo could feed articles live in state/shared?
    // addArticleFragment pulls externalArticle frag data for feedItem
    // and adds to state/shared prior to inserting into clipboard collection
    dispatch(addArticleFragment(id))
      .then(fragment => {
        let uuid;
        if (fragment) {
          uuid = fragment.uuid;
        } else {
          uuid = id;
        }
        dispatch(
          insertClipboardArticleFragment(
            'clipboard', // type: collection or clipboard
            'clipboard', // collection id
            articleFragmentSelector(selectSharedState(getState()), uuid),
            0 // index
          )
        );
      })
      .catch(() => {
        // @todo: implement once error handling is done
      });
};

export { handleMove, handleInsert, handleClipboardInsert, InsertActionCreator };
