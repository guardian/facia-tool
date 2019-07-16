import { State } from 'types/State';
import { matchIssuePath } from 'routes/routes';
import urls from 'constants/urls';

const matchRootPath = new RegExp(`^\/${urls.appRoot}`);
const maybeRemoveV2Prefix = (path: string) => path.replace(matchRootPath, '');

const selectFullPath = (state: State) => state.path;
const selectV2SubPath = (state: State) =>
  maybeRemoveV2Prefix(selectFullPath(state));
const selectIsEditingEditions = (state: State) =>
  !!matchIssuePath(selectV2SubPath(state));

export { selectFullPath, selectV2SubPath, selectIsEditingEditions };
