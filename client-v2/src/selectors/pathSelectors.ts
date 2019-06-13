import { State } from 'types/State';

const getFullPath = (state: State) => state.path;
const getV2Path = (state: State) => getFullPath(state).replace(/$\/v2/, '');

export { getFullPath, getV2Path };
