// @flow

import { isSubPath, pathForMove, hasMoved } from './path';
import type { Path } from './path';
import { move, insert } from '../edits';
import type { Edit } from '../edits';
import type { Drag, DuplicateGetter } from '../types';

const handleMove = (prevPath, nextPath, meta = {}): ?Edit => {
  const { type: dragType, id } = prevPath[prevPath.length - 1];
  const { type } = nextPath[nextPath.length - 1];

  if (dragType !== type) {
    throw new Error(`can't drop ${dragType} where ${type} should go`);
  }

  const movePath = pathForMove(prevPath, nextPath);
  const { index } = movePath[movePath.length - 1];

  return hasMoved(prevPath, nextPath)
    ? move(type, id, prevPath, movePath, index, meta)
    : null;
};

const handleInsert = (
  { type: dragType, path: dragPath, id, externalKey, meta, dropType },
  path,
  getDuplicate
): ?Edit => {
  const { type, index } = path[path.length - 1];

  if (dragType !== type) {
    throw new Error(`can't drop ${dragType} where ${type} should go`);
  }

  const key = externalKey || id;

  const duplicate = getDuplicate(key);

  // dragPath is always set on internal drags but flow isn't working this out
  if (dropType === 'INTERNAL' && dragPath && isSubPath(dragPath, path)) {
    throw new Error(`can't drop into itself`);
  }

  return duplicate
    ? handleMove(duplicate.path, path, meta)
    : insert(type, key, path, index, meta);
};

const getEdit = (
  inputData: Drag,
  inputPath: Path[],
  getDuplicate: DuplicateGetter
): ?Edit => handleInsert(inputData, inputPath, getDuplicate);

export { getEdit };
