import { FeedItem } from './FeedItem';
import React, { useCallback } from 'react';
import { State } from '../../types/State';
import {
  dragOffsetX,
  dragOffsetY,
} from '../FrontsEdit/CollectionComponents/ArticleDrag';
import { selectFeatureValue } from '../../selectors/featureSwitchesSelectors';
import { ContentInfo } from './ContentInfo';
import { CardTypesMap } from 'constants/cardTypes';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { insertCardWithCreate } from 'actions/Cards';
import {selectors as recipeSelectors} from  "bundles/recipesBundle";

interface ComponentProps {
  id: string;
}

export const RecipeFeedItem = ({ id }: ComponentProps) => {
  const shouldObscureFeed = useSelector<State, boolean>((state) =>
    selectFeatureValue(state, 'obscure-feed')
  );

  const dispatch = useDispatch();

  const recipe = useSelector((state)=>
    recipeSelectors.selectById(state, id)!
  );

  const onAddToClipboard = useCallback(() => {
    dispatch<any>(
      insertCardWithCreate(
        { type: 'clipboard', id: 'clipboard', index: 0 },
        { type: 'RECIPE', data: recipe },
        'clipboard'
      )
    );
  }, [recipe]);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    dragNode: HTMLDivElement
  ) => {
    event.dataTransfer.setData('recipe', JSON.stringify(recipe));
    if (dragNode) {
      event.dataTransfer.setDragImage(dragNode, dragOffsetX, dragOffsetY);
    }
  };

  return (
    <FeedItem
      type={CardTypesMap.RECIPE}
      id={recipe.canonicalArticle}
      title={recipe.title}
      thumbnail={recipe.featuredImage.url}
      liveUrl={`https://theguardian.com/${recipe.canonicalArticle}`}
      hasVideo={false}
      isLive={true} // We do not yet serve preview recipes
      handleDragStart={handleDragStart}
      onAddToClipboard={onAddToClipboard}
      shouldObscureFeed={shouldObscureFeed}
      metaContent={<ContentInfo>Recipe</ContentInfo>}
    />
  );
};
