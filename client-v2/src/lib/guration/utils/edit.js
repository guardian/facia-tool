

import { isSubPath, pathForMove, hasMoved } from './path';
import type { Path } from './path';
import { move, insert } from '../edits';
import type { Edit } from '../edits';
import type { Drag } from '../types';

const handleMove = (prevPath, nextPath, meta = {}): ?Edit => {
  const { type: dragType, id } = prevPath[prevPath.length - 1];
  const { type } = nextPath[nextPath.length - 1];

  if (dragType !== type) {
    throw new Error(`can't drop ${dragType} where ${type} should go`);
  }

  if (isSubPath(prevPath, nextPath)) {
    throw new Error(`can't drop into itself`);
  }

  const movePath = pathForMove(prevPath, nextPath);
  const { index } = movePath[movePath.length - 1];

  return hasMoved(prevPath, nextPath)
    ? move(type, id, prevPath, movePath, index, meta)
    : null;
};

const handleInsert = ({ type: dragType, id, meta }, path): ?Edit => {
  const { type, index } = path[path.length - 1];

  if (dragType !== type) {
    throw new Error(`can't drop ${dragType} where ${type} should go`);
  }

  return insert(type, id, path, index, meta);
};

const getEdit = (inputData: Drag, inputPath: Path[]): ?Edit =>
  inputData.dropType === 'INTERNAL'
    ? handleMove(inputData.path, inputPath)
    : handleInsert(inputData, inputPath);

export { getEdit };
