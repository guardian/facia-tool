import { State } from 'types/State';
import { selectV2SubPath } from 'selectors/pathSelectors';
import { matchFrontsEditPath, matchIssuePath } from 'routes/routes';

interface StrategyMap<R> {
  edition: (issueId: string) => R;
  front: (priority: string) => R;
  none: () => R;
}

const runStrategy = <R>(state: State, strategies: StrategyMap<R>) => {
  const path = selectV2SubPath(state);

  const frontsMatch = matchFrontsEditPath(path);
  if (frontsMatch) {
    return strategies.front(frontsMatch.params.priority);
  }

  const editionsMatch = matchIssuePath(path);
  if (editionsMatch) {
    return strategies.edition(editionsMatch.params.priority);
  }

  return strategies.none();
};

export { runStrategy };
