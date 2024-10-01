import type { Action, ActionPersistMeta } from 'types/Action';
import type { PersistMeta } from './storeMiddleware';

export const addPersistMetaToAction = <TArgs extends any[]>(
	actionCreator: (...args: TArgs) => Action,
	meta: PersistMeta,
): ((...args: TArgs) => Action & ActionPersistMeta) => {
	return (...args: TArgs): Action & ActionPersistMeta =>
		Object.assign({}, actionCreator(...args), { meta });
};
