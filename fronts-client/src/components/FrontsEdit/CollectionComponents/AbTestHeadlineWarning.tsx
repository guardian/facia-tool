import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { State } from 'types/State';
import {
	AbTestHeadlineError,
	createSelectActiveAbTestHeadlineErrorsForCollection,
} from 'selectors/collection';
import CollectionWarningList from './CollectionWarningList';

interface Props {
	collectionId: string;
}

const errorMessage = (error: AbTestHeadlineError['error']): string =>
	error === 'duplicate'
		? 'headline variants A and B are the same'
		: 'headline variants A and B must both be set';

const AbTestHeadlineWarning = ({ collectionId }: Props) => {
	const selectActiveAbTestHeadlineErrorsForCollection = useMemo(
		() => createSelectActiveAbTestHeadlineErrorsForCollection(),
		[],
	);
	const items = useSelector((state: State) =>
		selectActiveAbTestHeadlineErrorsForCollection(state, { collectionId }),
	).map(({ cardId, title, error }) => ({
		id: cardId,
		title,
		suffix: `: ${errorMessage(error)}`,
	}));

	return (
		<CollectionWarningList
			heading="This collection cannot be launched because of an incomplete active headline test:"
			items={items}
		/>
	);
};

export default AbTestHeadlineWarning;
