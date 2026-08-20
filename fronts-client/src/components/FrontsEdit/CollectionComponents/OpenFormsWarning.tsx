import { connect } from 'react-redux';
import type { State } from 'types/State';
import { createSelectOpenCardTitlesForCollection } from 'bundles/frontsUI';
import CollectionWarningList from './CollectionWarningList';

interface ContainerProps {
	collectionId: string;
	frontId: string;
}

const mapStateToProps = () => {
	const selectOpenCardTitlesForCollection =
		createSelectOpenCardTitlesForCollection();
	return (state: State, { collectionId, frontId }: ContainerProps) => ({
		heading: 'There are open forms in this collection:',
		items: selectOpenCardTitlesForCollection(state, {
			collectionId,
			frontId,
		}).map(({ uuid, title }) => ({ id: uuid, title })),
	});
};

export default connect(mapStateToProps)(CollectionWarningList);
