import {
  dragOffsetX,
  dragOffsetY,
} from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import { CardTypesMap } from 'constants/cardTypes';
import { CARD_TYPE } from 'lib/dnd/constants';
import { InsertDropType } from './collectionUtils';

export const handleDragStartForCard =
  (cardType: InsertDropType, data: unknown) =>
  (event: React.DragEvent<HTMLDivElement>, dragNode: HTMLDivElement) => {
    event.dataTransfer.setData(cardType, JSON.stringify(data));
    event.dataTransfer.setData(CARD_TYPE, CardTypesMap.CHEF);
    if (dragNode) {
      event.dataTransfer.setDragImage(dragNode, dragOffsetX, dragOffsetY);
    }
  };
