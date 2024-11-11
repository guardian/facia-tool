import { createSelectorCreator } from 'reselect';
import shallowequal from 'shallowequal';

export const defaultObject = {};
export const defaultArray = [];

const defaultEqualityCheck = (a: any, b: any) => a === b;

function resultCheckMemoize<A extends any[], R>(func: (...args: A) => R) {
	let last: [A, R] | null = null;
	return (...args: A): R => {
		if (!last) {
			const res = func(...args);
			last = [args, res];
			return res;
		}

		const [lastArgs, lastResult] = last;

		if (
			lastArgs.length === args.length &&
			args.every((value, index) => defaultEqualityCheck(value, lastArgs[index]))
		) {
			return lastResult;
		}

		const result = func(...args);

		if (shallowequal(lastResult, result)) {
			last = [args, lastResult];
			return lastResult;
		} else {
			last = [args, result];
			return result;
		}
	};
}

const createShallowEqualResultSelector = createSelectorCreator(
	// there seems to be an issue with the reselect typings, but even when casting resultCheckMemoize
	// as any and never, the selectors that result are still strongly typed i.e. the issues are local only
	// to here
	resultCheckMemoize as any,
	defaultEqualityCheck,
	shallowequal,
);

export { createShallowEqualResultSelector };
