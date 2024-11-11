import type { State } from 'types/State';
import { selectV2SubPath } from 'selectors/pathSelectors';
import { matchFrontsEditPath, matchIssuePath } from 'routes/routes';
import { selectors as editionsIssueSelectors } from '../bundles/editionsIssueBundle';

interface StrategyMap<R> {
	edition: (issueId: string) => R;
	front: (priority: string) => R;
	feast: (priority: string) => R;
	none: () => R;
}

const runStrategy = <R>(state: State, strategies: StrategyMap<R>) => {
	const path = selectV2SubPath(state);
	const isFeast = editionsIssueSelectors.selectAll(state)?.platform === 'feast';

	const frontsMatch = matchFrontsEditPath(path);
	if (frontsMatch) {
		return strategies.front(frontsMatch.params.priority);
	}

	const issueMatch = matchIssuePath(path);

	if (issueMatch && isFeast) {
		return strategies.feast(issueMatch.params.priority);
	}

	if (issueMatch) {
		return strategies.edition(issueMatch.params.priority);
	}

	return strategies.none();
};

export { runStrategy };
