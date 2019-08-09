import { State } from 'types/State';
import { matchIssuePath, matchFrontsEditPath } from 'routes/routes';
import urls from 'constants/urls';
import { EditMode } from 'types/EditMode';

const matchRootPath = new RegExp(`^\/${urls.appRoot}`);
const maybeRemoveV2Prefix = (path: string) => path.replace(matchRootPath, '');
const selectFullPath = (state: State) => state.path;
const selectV2SubPath = (state: State) =>
  maybeRemoveV2Prefix(selectFullPath(state));

const selectEditMode = (state: State): EditMode => {
  if (!!matchIssuePath(selectV2SubPath(state))) {
    return 'editions';
  } else {
    return 'fronts';
  }
};

const selectPriority = (state: State) => {
  const path = selectV2SubPath(state);
  const match = matchFrontsEditPath(path) || matchIssuePath(path);
  if (!match || !match.params.priority) {
    return;
  }
  return match.params.priority;
};

export { selectFullPath, selectV2SubPath, selectEditMode, selectPriority };
