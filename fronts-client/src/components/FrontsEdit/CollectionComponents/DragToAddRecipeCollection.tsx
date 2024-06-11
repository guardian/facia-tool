import React, { useRef } from 'react';
import v4 from 'uuid/v4';

import {
  DraggingArticleComponent,
  dragOffsetX,
  dragOffsetY,
} from './ArticleDrag';
import { DragToAdd } from './DragToAdd';
import { Card } from 'types/Collection';

const handleDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  dragImageElement: HTMLDivElement | null
) => {
  const recipeCollectionCard: Card = {
    cardType: 'recipe-collection',
    id: v4(),
    meta: {},
    uuid: v4(),
    frontPublicationDate: Date.now(),
  };
  event.dataTransfer.setData(
    'recipe-collection',
    JSON.stringify(recipeCollectionCard)
  );
  if (dragImageElement) {
    event.dataTransfer.setDragImage(dragImageElement, dragOffsetX, dragOffsetY);
  }
};

export const DragToAddRecipeCollection = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <DragToAdd
      dragImage={<DraggingArticleComponent headline="Recipe collection" />}
      dragImageRef={ref}
      onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
        handleDragStart(e, ref.current)
      }
    >
      Drag to add a recipe collection
    </DragToAdd>
  );
};
