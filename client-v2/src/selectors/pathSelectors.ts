import { State } from 'types/State';
import { matchIssuePath } from 'routes/routes';

const maybeRemoveV2Prefix = (path: string) => path.replace(/^\/v2/, '');

const getFullPath = (state: State) => state.path;
const getV2SubPath = (state: State) => maybeRemoveV2Prefix(getFullPath(state));
const selectIsEditingEditions = (state: State) =>
  !!matchIssuePath(getV2SubPath(state));

export { getFullPath, getV2SubPath, selectIsEditingEditions };
