import React from 'react';
import { getIdFromURL } from 'util/CAPIUtils';
import { ThunkResult } from 'types/Store';
import { Dispatch } from 'types/Store';
import { Move, PosSpec } from 'lib/dnd';
import { ArticleFragment } from 'shared/types/Collection';
import keyBy from 'lodash/keyBy';
import {
  articleFragmentsReceived,
  addArticleFragment
} from 'shared/actions/ArticleFragments';

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

const handleInsert = (
  e: React.DragEvent,
  insertActionCreator: InsertActionCreator,
  dispatch: Dispatch,
  to: PosSpec
) => {
  const id = dropToArticle(e);
  if (!id) {
    return;
  }
  dispatch(addArticleFragment(id)).then(
    fragment =>
      fragment &&
      dispatch(
        insertActionCreator(
          to.type, // the name of the level above
          to.id,
          fragment,
          to.index
        )
      )
  );
};

export { handleMove, handleInsert };
