import React from 'react';
import { Card } from 'types/Collection';
import Level, { LevelProps } from './Level';
import { CardTypes, CardTypesMap } from 'constants/cardTypes';
import { collectionDropTypeDenylist } from 'constants/fronts';
import { CARD_TYPE } from './constants';

type Props = Omit<LevelProps<Card>, 'denyDragEvent' | 'getDropType'> & {
  cardTypeAllowList?: CardTypes[];
};

export const denyDragEvent =
  (cardTypeAllowList?: string[] | undefined) => (e: React.DragEvent) => {
    const dropEventIsNotPermitted = e.dataTransfer.types.some((type) =>
      collectionDropTypeDenylist.includes(type)
    );

    const cardTypeBeingDroppedIsNotPermitted =
      !!cardTypeAllowList &&
      !!e.dataTransfer.getData(CARD_TYPE) &&
      !cardTypeAllowList.includes(e.dataTransfer.getData(CARD_TYPE));

    return dropEventIsNotPermitted || cardTypeBeingDroppedIsNotPermitted;
  };

/**
 * A Level that only accepts a Card type. Useful for providing common drag and
 * behaviour for Card components.
 */
export const CardTypeLevel: React.FC<Props> = (props: Props) => (
  <Level
    {...props}
    denyDragEvent={denyDragEvent(props.cardTypeAllowList)}
    getDropType={(card) => card.cardType || CardTypesMap.ARTICLE}
  />
);
