import { State } from 'types/State';
import { matchPath } from 'react-router';
import { getV2SubPath } from 'selectors/pathSelectors';
import { frontsEdit } from 'constants/routes';

interface StrategyMap<R> {
  edition: (editionId: string) => R;
  front: (priority: string) => R;
  none: () => R;
}

const isValidPathForEdition = (priority: string, id?: string): id is string =>
  !!id && priority === 'edition';

const runStrategy = <R>(state: State, strategies: StrategyMap<R>) => {
  const editMatch = matchPath<{ priority: string; editionId?: string }>(
    getV2SubPath(state),
    {
      path: frontsEdit
    }
  );

  if (!editMatch) {
    return strategies.none();
  }

  const {
    params: { priority, editionId }
  } = editMatch;

  if (isValidPathForEdition(priority, editionId)) {
    return strategies.edition(editionId);
  }

  return strategies.front(priority);
};

export { runStrategy };
