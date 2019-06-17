import { State } from 'types/State';

const maybeRemoveV2Prefix = (path: string) => path.replace(/^\/v2/, '');

const getFullPath = (state: State) => state.path;
const getV2SubPath = (state: State) => maybeRemoveV2Prefix(getFullPath(state));

export { getFullPath, getV2SubPath };
