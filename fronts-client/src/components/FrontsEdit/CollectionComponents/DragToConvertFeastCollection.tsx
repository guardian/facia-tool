import React, { useRef } from 'react';
import { DraggingArticleComponent } from './ArticleDrag';
import { DragToAdd } from './DragToAdd';
import { Card } from '../../../types/Collection';
import { CardTypesMap } from '../../../constants/cardTypes';
import v4 from 'uuid/v4';
import { handleDragStartForCard } from '../../../util/dragAndDrop';
import { useSelector } from 'react-redux';
import { selectors as collectionSelectors } from '../../../bundles/collectionsBundle';
import { createSelectCardsInCollection } from '../../../selectors/shared';
import { State } from '../../../types/State';

interface DragToConvertFeastCollectionProps {
  sourceContainerId: string;
}

export const DragToConvertFeastCollection:React.FC<DragToConvertFeastCollectionProps> = ({sourceContainerId})=>{
  const ref = useRef<HTMLDivElement>(null);

  /*
        collection: collectionSelectors.selectById(state, props.id),
      cardIds: selectCardsInCollection(state, {
        collectionId: props.id,
        collectionSet: props.browsingStage,
        includeSupportingArticles: false,
      }),
   */
  const containerInfo = useSelector(state=>collectionSelectors.selectById(state, sourceContainerId));
  const cardSelector = createSelectCardsInCollection();
  const cards = useSelector<State>(state=>cardSelector(state, {
    collectionId: sourceContainerId,
    collectionSet: "draft",
    includeSupportingArticles: false
  })) as string[];

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    console.log("DragToConvertFeastCollection");
    console.log(`sourceContainerId = ${sourceContainerId}`);
    console.log(`cards = ${cards}`);
    console.log(`containerInfo = ${JSON.stringify(containerInfo)}`);

    if(ref.current) {
      const feastCollectionCard: Card = {
        cardType: CardTypesMap.FEAST_COLLECTION,
        id: v4(),
        meta: {
          title: containerInfo?.displayName ?? "New collection",
          supporting: cards,
        },
        uuid: v4(),
        frontPublicationDate: Date.now(),
      };

      console.log(`newCollection: ${JSON.stringify(feastCollectionCard)}`);

      return handleDragStartForCard(
        CardTypesMap.FEAST_COLLECTION,
        feastCollectionCard
      )(event, ref.current);
    }
  }

  return (
    <DragToAdd onDragStart={handleDragStart}
               dragImage={<DraggingArticleComponent headline="Feast collection" />}
               dragImageRef={ref}>
      Drag to convert to Feast collection
    </DragToAdd>
  )
}
