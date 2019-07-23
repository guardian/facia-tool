import { State } from 'types/State';
import { matchIssuePath } from 'routes/routes';
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

export { selectFullPath, selectV2SubPath, selectEditMode };
