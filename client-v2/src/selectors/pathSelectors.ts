import { matchIssuePath, matchFrontsEditPath } from 'routes/routes';
import urls from 'constants/urls';
import { EditMode } from 'types/EditMode';

const matchRootPath = new RegExp(`^\/${urls.appRoot}`);
const maybeRemoveV2Prefix = (path: string) => path.replace(matchRootPath, '');
const selectFullPath = <T>(state: { path: string } & T) => state.path;
const selectV2SubPath = <T>(state: { path: string } & T) =>
  maybeRemoveV2Prefix(selectFullPath(state));

const selectEditMode = <T>(state: { path: string } & T): EditMode => {
  if (!!matchIssuePath(selectV2SubPath(state))) {
    return 'editions';
  } else {
    return 'fronts';
  }
};

const selectPriority = <T>(state: { path: string } & T) => {
  const path = selectV2SubPath(state);
  const match = matchFrontsEditPath(path) || matchIssuePath(path);
  if (!match || !match.params.priority) {
    return;
  }
  return match.params.priority;
};

export { selectFullPath, selectV2SubPath, selectEditMode, selectPriority };
