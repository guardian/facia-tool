import { matchIssuePath, matchFrontsEditPath } from 'routes/routes';
import url from 'constants/url';
import { EditMode } from 'types/EditMode';
import { Priorities } from 'types/Priority';

const matchRootPath = new RegExp(`^\/${url.appRoot}`);
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

const isMode = <T>(state: { path: string } & T, mode: EditMode): boolean => {
	return selectEditMode(state) === mode;
};

const selectPriority = <T>(
	state: { path: string } & T,
): keyof Priorities | undefined => {
	const path = selectV2SubPath(state);
	const match = matchFrontsEditPath(path) || matchIssuePath(path);
	if (!match || !match.params.priority) {
		return;
	}
	return match.params.priority as keyof Priorities;
};

export {
	selectFullPath,
	selectV2SubPath,
	selectEditMode,
	selectPriority,
	isMode,
};
