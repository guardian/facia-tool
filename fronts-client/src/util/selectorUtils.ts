import { createSelectorCreator } from 'reselect';
import shallowequal from 'shallowequal';
import isEqual from 'lodash/isEqual';

/***
 	React and Redux use object identities to work out what has changed.
	In JS, empty objects are not equal to one another, so we pass this to ensure a stable identity.
 ***/
export const emptyObject = {};

const defaultEqualityCheck = (a: any, b: any) => a === b;

function resultCheckMemoize<A extends any[], R>(func: (...args: A) => R) {
	return resultCheckMemoizeWithEquality(func, shallowequal);
}

function resultCheckMemoizeWithEquality<A extends any[], R>(
	func: (...args: A) => R,
	resultsAreEqual: (a: R, b: R) => boolean,
) {
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

		if (resultsAreEqual(lastResult, result)) {
			last = [args, lastResult];
			return lastResult;
		} else {
			last = [args, result];
			return result;
		}
	};
}

function deepEqualResultCheckMemoize<A extends any[], R>(
	func: (...args: A) => R,
) {
	return resultCheckMemoizeWithEquality(func, isEqual);
}

const createShallowEqualResultSelector = createSelectorCreator(
	// there seems to be an issue with the reselect typings, but even when casting resultCheckMemoize
	// as any and never, the selectors that result are still strongly typed i.e. the issues are local only
	// to here
	resultCheckMemoize as any,
	defaultEqualityCheck,
	shallowequal,
);

/**
 * Like createShallowEqualResultSelector, but keeps the previous result
 * reference when the newly computed result is *deeply* equal. Use this for
 * selectors whose result is a nested structure (e.g. a map of objects) that is
 * rebuilt from scratch on each recompute: a shallow result check would see the
 * fresh nested objects as changed and return a new reference, needlessly
 * re-rendering connected components even when the content is identical.
 */
const createDeepEqualResultSelector = createSelectorCreator(
	deepEqualResultCheckMemoize as any,
	defaultEqualityCheck,
	shallowequal,
);

export { createShallowEqualResultSelector, createDeepEqualResultSelector };
