import {
  InsertArticleFragment,
  RemoveArticleFragment
} from 'shared/types/Action';
import { ArticleFragment } from 'shared/types/Collection';

/**
 * This is just a bunch of utility functions to be used in a reducer to ensuer
 * that the `SHARED_(INSERT/REMOVE)_ARTICLE_FRAGMENT` actions only get handled
 * when they have the correct parent `type` in their `payload`. Those actions
 * are now event streams that various parents of article fragments can listen
 * for but only some of the actions will be relevant to any given reducer.
 */

type RemoveHandler<S> = (id: string, articleFragmentId: string) => S;

type InsertHandler<S> = (action: InsertArticleFragment['payload']) => S;

export const handleInsertArticleFragment = <S>(
  state: S,
  action: InsertArticleFragment,
  type: string,
  onInsert: InsertHandler<S>
): S => {
  const { to, id } = action.payload;
  return type === to.type ? onInsert(action.payload) : state;
};

export const handleRemoveArticleFragment = <S>(
  state: S,
  action: RemoveArticleFragment,
  type: string,
  onRemove: RemoveHandler<S>
): S => {
  const { parentType, id, articleFragmentId } = action.payload;
  return type === parentType ? onRemove(id, articleFragmentId) : state;
};
