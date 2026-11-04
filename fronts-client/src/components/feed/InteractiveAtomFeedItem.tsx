import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { CardTypesMap } from 'constants/cardTypes';
import { CapiInteractiveAtom } from 'types/Capi';
import { handleDragStartForCard } from 'util/dragAndDrop';
import { insertCardWithCreate } from 'actions/Cards';
import { FeedItem } from './FeedItem';
import { ContentInfo } from './ContentInfo';

interface Props {
	atom: CapiInteractiveAtom;
}

/**
 * Dropping one of these creates an interactive atom snap link -- see
 * `createAtomSnapFromInteractiveAtom` in util/snap.
 */
export const InteractiveAtomFeedItem = ({ atom }: Props) => {
	const dispatch = useDispatch();

	const onAddToClipboard = useCallback(() => {
		dispatch<any>(
			insertCardWithCreate(
				{ type: 'clipboard', id: 'clipboard', index: 0 },
				{ type: 'INTERACTIVE_ATOM', data: atom },
				'clipboard',
			),
		);
	}, [dispatch, atom]);

	return (
		<FeedItem
			id={atom.id}
			type={CardTypesMap.INTERACTIVE_ATOM}
			title={atom.data.interactive.title}
			hasVideo={false}
			isLive={true}
			urlPath={atom.id}
			onAddToClipboard={onAddToClipboard}
			handleDragStart={handleDragStartForCard(
				CardTypesMap.INTERACTIVE_ATOM,
				atom,
			)}
			// Atoms have no page of their own on theguardian.com.
			showViewButton={false}
			metaContent={<ContentInfo>Interactive atom</ContentInfo>}
		/>
	);
};
