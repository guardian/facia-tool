import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { State } from 'types/State';
import { createSelectOpenCardTitlesForCollection } from 'bundles/frontsUI';
import CollectionWarningList from './CollectionWarningList';

interface Props {
	collectionId: string;
	frontId: string;
}

const OpenFormsWarning = ({ collectionId, frontId }: Props) => {
	const selectOpenCardTitlesForCollection = useMemo(
		() => createSelectOpenCardTitlesForCollection(),
		[],
	);
	const items = useSelector((state: State) =>
		selectOpenCardTitlesForCollection(state, { collectionId, frontId }),
	).map(({ uuid, title }) => ({ id: uuid, title }));

	return (
		<CollectionWarningList
			heading="There are open forms in this collection:"
			items={items}
		/>
	);
};

export default OpenFormsWarning;
