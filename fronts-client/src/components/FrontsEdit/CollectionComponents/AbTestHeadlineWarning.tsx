import { connect } from 'react-redux';
import type { State } from 'types/State';
import {
	AbTestHeadlineError,
	createSelectActiveAbTestHeadlineErrorsForCollection,
} from 'selectors/collection';
import CollectionWarningList from './CollectionWarningList';

interface ContainerProps {
	collectionId: string;
}

const errorMessage = (error: AbTestHeadlineError['error']): string =>
	error === 'duplicate'
		? 'headline variants A and B are the same'
		: 'headline variants A and B must both be set';

const mapStateToProps = () => {
	const selectActiveAbTestHeadlineErrorsForCollection =
		createSelectActiveAbTestHeadlineErrorsForCollection();
	return (state: State, { collectionId }: ContainerProps) => ({
		heading:
			'This collection cannot be launched because of an incomplete active headline test:',
		items: selectActiveAbTestHeadlineErrorsForCollection(state, {
			collectionId,
		}).map(({ cardId, title, error }) => ({
			id: cardId,
			title,
			suffix: `: ${errorMessage(error)}`,
		})),
	});
};

export default connect(mapStateToProps)(CollectionWarningList);
