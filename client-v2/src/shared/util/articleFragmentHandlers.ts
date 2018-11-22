import {
  InsertArticleFragment,
  RemoveArticleFragment
} from 'shared/types/Action';
import { ArticleFragment } from 'shared/types/Collection';

interface ArticleFragmentMap {
  [uuid: string]: ArticleFragment;
}

type RemoveHandler<S> = (id: string, articleFragmentId: string) => S;

type InsertHandler<S> = (
  id: string,
  articleFragmentId: string,
  index: number,
  articleFragmentMap: ArticleFragmentMap
) => S;

export const handleInsertArticleFragment = <S>(
  state: S,
  action: InsertArticleFragment,
  type: string,
  onInsert: InsertHandler<S>
): S => {
  const { to, id, articleFragmentMap } = action.payload;
  return type === to.type
    ? onInsert(to.id, id, to.index, articleFragmentMap)
    : state;
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
