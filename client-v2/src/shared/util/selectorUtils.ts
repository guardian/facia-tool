import { createSelectorCreator } from 'reselect';
import shallowequal from 'shallowequal';

const defaultEqualityCheck = (a: any, b: any) => a === b;

function resultCheckMemoize<A extends any[], R>(func: (...args: A) => R) {
  let last: [A, R] | null = null;
  return (...args: A): R => {
    if (!last) {
      let result = func(...args);
      last = [args, result];
      return result;
    }

    const [lastArgs, lastResult] = last;

    if (
      lastArgs.length === args.length &&
      args.every((value, index) => defaultEqualityCheck(value, lastArgs[index]))
    ) {
      return lastResult;
    }

    let result = func(...args);

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
  resultCheckMemoize as any,
  defaultEqualityCheck,
  shallowequal
);

export { createShallowEqualResultSelector };
