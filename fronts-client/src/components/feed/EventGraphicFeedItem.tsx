import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { CardTypesMap } from 'constants/cardTypes';
import { EventGraphic } from 'constants/eventGraphics';
import { handleDragStartForCard } from 'util/dragAndDrop';
import { insertCardWithCreate } from 'actions/Cards';
import { FeedItem } from './FeedItem';
import { ContentInfo, ContentExtra } from './ContentInfo';

interface Props {
	eventGraphic: EventGraphic;
}

export const EventGraphicFeedItem = ({ eventGraphic }: Props) => {
	const dispatch = useDispatch();

	const onAddToClipboard = useCallback(() => {
		dispatch<any>(
			insertCardWithCreate(
				{ type: 'clipboard', id: 'clipboard', index: 0 },
				{ type: 'EVENT_GRAPHIC', data: eventGraphic },
				'clipboard',
			),
		);
	}, [dispatch, eventGraphic]);

	return (
		<FeedItem
			id={eventGraphic.id}
			type={CardTypesMap.EVENT_GRAPHIC}
			title={eventGraphic.title}
			hasVideo={false}
			isLive={false}
			urlPath={eventGraphic.id}
			onAddToClipboard={onAddToClipboard}
			handleDragStart={handleDragStartForCard(
				CardTypesMap.EVENT_GRAPHIC,
				eventGraphic,
			)}
			// No page of its own to view.
			showViewButton={false}
			metaContent={
				<>
					<ContentInfo>Event graphic</ContentInfo>
					{eventGraphic.description && (
						<ContentExtra>{eventGraphic.description}</ContentExtra>
					)}
				</>
			}
		/>
	);
};
