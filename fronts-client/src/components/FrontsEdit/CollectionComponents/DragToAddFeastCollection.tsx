import React, { useRef } from 'react';
import v4 from 'uuid/v4';

import {
  DraggingArticleComponent,
  dragOffsetX,
  dragOffsetY,
} from './ArticleDrag';
import { DragToAdd } from './DragToAdd';
import { Card } from 'types/Collection';
import { CardTypesMap } from 'constants/cardTypes';
import { CARD_TYPE } from 'lib/dnd/constants';

const handleDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  dragImageElement: HTMLDivElement | null
) => {
  const feastCollectionCard: Card = {
    cardType: CardTypesMap.FEAST_COLLECTION,
    id: v4(),
    meta: {},
    uuid: v4(),
    frontPublicationDate: Date.now(),
  };
  event.dataTransfer.setData(
    CardTypesMap.FEAST_COLLECTION,
    JSON.stringify(feastCollectionCard)
  );
  event.dataTransfer.setData(CARD_TYPE, CardTypesMap.FEAST_COLLECTION);
  if (dragImageElement) {
    event.dataTransfer.setDragImage(dragImageElement, dragOffsetX, dragOffsetY);
  }
};

export const DragToAddFeastCollection = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <DragToAdd
      dragImage={<DraggingArticleComponent headline="Feast collection" />}
      dragImageRef={ref}
      onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
        handleDragStart(e, ref.current)
      }
    >
      Drag to add a feast collection
    </DragToAdd>
  );
};
