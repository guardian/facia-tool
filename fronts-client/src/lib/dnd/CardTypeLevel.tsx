import React from 'react';
import { Card } from 'types/Collection';
import Level, { LevelProps } from './Level';
import { CardTypes, CardTypesMap } from 'constants/cardTypes';
import { collectionDropTypeDenylist } from 'constants/fronts';
import { isEventGraphicId } from 'constants/eventGraphics';
import { CARD_TYPE } from './constants';
import ArticleDrag, {
	dragOffsetX,
	dragOffsetY,
} from 'components/FrontsEdit/CollectionComponents/ArticleDrag';

type Props = Omit<
	LevelProps<Card>,
	| 'denyDragEvent'
	| 'getDropType'
	| 'dragImageOffsetX'
	| 'dragImageOffsetY'
	| 'renderDrag'
	| 'type'
	| 'getId'
> & {
	cardTypeAllowList?: CardTypes[];
	cardTypeDenyList?: CardTypes[];
};

export const denyDragEvent =
	(
		cardTypeAllowList?: string[] | undefined,
		cardTypeDenyList?: string[] | undefined,
	) =>
	(e: React.DragEvent) => {
		const dropEventIsNotPermitted = e.dataTransfer.types.some((type) =>
			collectionDropTypeDenylist.includes(type),
		);

		const cardTypeBeingDropped = e.dataTransfer.getData(CARD_TYPE);

		const cardTypeBeingDroppedIsNotPermitted =
			!!cardTypeAllowList &&
			!!cardTypeBeingDropped &&
			!cardTypeAllowList.includes(cardTypeBeingDropped);

		const cardTypeBeingDroppedIsDenied =
			!!cardTypeDenyList &&
			!!cardTypeBeingDropped &&
			cardTypeDenyList.includes(cardTypeBeingDropped);

		return (
			dropEventIsNotPermitted ||
			cardTypeBeingDroppedIsNotPermitted ||
			cardTypeBeingDroppedIsDenied
		);
	};

/**
 * The type advertised when a card already on a front or the clipboard is
 * dragged. `cardType` isn't persisted, so saved event graphics have to be typed
 * from their id -- otherwise they'd look like articles and could be dropped as
 * sublinks.
 */
export const getCardDropType = (card: Card): CardTypes =>
	card.cardType ??
	(isEventGraphicId(card.id)
		? CardTypesMap.EVENT_GRAPHIC
		: CardTypesMap.ARTICLE);

/**
 * A Level that only accepts a Card type. Useful for providing common drag and
 * behaviour for Card components.
 */
export const CardTypeLevel: React.FC<Props> = (props: Props) => (
	<Level
		{...props}
		denyDragEvent={denyDragEvent(
			props.cardTypeAllowList,
			props.cardTypeDenyList,
		)}
		getDropType={getCardDropType}
		dragImageOffsetX={dragOffsetX}
		dragImageOffsetY={dragOffsetY}
		renderDrag={(af) => <ArticleDrag id={af.uuid} />}
		type="card"
		getId={({ uuid }) => uuid}
	/>
);
