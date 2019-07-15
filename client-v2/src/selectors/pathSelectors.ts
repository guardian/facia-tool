import { State } from 'types/State';
import { matchIssuePath } from 'routes/routes';

const maybeRemoveV2Prefix = (path: string) => path.replace(/^\/v2/, '');

const selectFullPath = (state: State) => state.path;
const selectV2SubPath = (state: State) =>
  maybeRemoveV2Prefix(selectFullPath(state));
const selectIsEditingEditions = (state: State) =>
  !!matchIssuePath(selectV2SubPath(state));

export { selectFullPath, selectV2SubPath, selectIsEditingEditions };
