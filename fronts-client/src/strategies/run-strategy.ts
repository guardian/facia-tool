import type { State } from 'types/State';
import { selectV2SubPath } from 'selectors/pathSelectors';
import { matchFrontsEditPath, matchIssuePath } from 'routes/routes';

interface StrategyMap<R> {
  edition: (issueId: string) => R;
  front: (priority: string) => R;
  feast: (priority: string) => R;
  none: () => R;
}

const runStrategy = <R>(state: State, strategies: StrategyMap<R>) => {
  const path = selectV2SubPath(state);

  const frontsMatch = matchFrontsEditPath(path);
  if (frontsMatch) {
    return strategies.front(frontsMatch.params.priority);
  }

  const editionsMatch = matchIssuePath(path);
  if (
    editionsMatch &&
    editionsMatch.params.priority != 'c5f8225b-3ee8-4bbb-8459-71bf15f23efd' // for testing only to check if not we are not on feast edition , will remove with proper way of having this condition
  ) {
    return strategies.edition(editionsMatch.params.priority);
  }

  const feastMatch = matchIssuePath(path);
  if (feastMatch) {
    return strategies.feast(feastMatch.params.priority);
  }

  return strategies.none();
};

export { runStrategy };
