import React, { useRef } from 'react';
import v4 from 'uuid/v4';
import { DraggingArticleComponent } from './ArticleDrag';
import { DragToAdd } from './DragToAdd';
import { Card } from 'types/Collection';
import { CardTypesMap } from 'constants/cardTypes';
import { handleDragStartForCard } from 'util/dragAndDrop';

const handleDragStart = (
	event: React.DragEvent<HTMLDivElement>,
	dragImageElement: HTMLDivElement,
) => {
	const feastCollectionCard: Card = {
		cardType: CardTypesMap.FEAST_COLLECTION,
		id: v4(),
		meta: {},
		uuid: v4(),
		frontPublicationDate: Date.now(),
	};

	return handleDragStartForCard(
		CardTypesMap.FEAST_COLLECTION,
		feastCollectionCard,
	)(event, dragImageElement);
};

export const DragToAddFeastCollection = () => {
	const ref = useRef<HTMLDivElement>(null);
	return (
		<DragToAdd
			dragImage={<DraggingArticleComponent headline="Feast collection" />}
			dragImageRef={ref}
			onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
				ref.current && handleDragStart(e, ref.current)
			}
		>
			Drag to add a feast collection
		</DragToAdd>
	);
};
