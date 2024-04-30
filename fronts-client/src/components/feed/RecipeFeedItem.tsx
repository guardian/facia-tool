import { Recipe } from '../../types/Recipe';
import { FeedItem } from './FeedItem';
import React from 'react';
import { State } from '../../types/State';
import {
  dragOffsetX,
  dragOffsetY,
} from '../FrontsEdit/CollectionComponents/ArticleDrag';
import noop from 'lodash/noop';
import { selectFeatureValue } from '../../selectors/featureSwitchesSelectors';
import { connect } from 'react-redux';
import { ContentInfo } from './ContentInfo';

interface ComponentProps {
  recipe: Recipe;
  shouldObscureFeed: boolean;
}

export const RecipeFeedItemComponent = ({
  recipe,
  shouldObscureFeed,
}: ComponentProps) => {
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
      id={recipe.id}
      title={recipe.title}
      thumbnail={recipe.featuredImage.url}
      liveUrl={`https://theguardian.com/${recipe.canonicalArticle}`}
      hasVideo={false}
      isLive={true} // We do not yet serve preview recipes
      handleDragStart={handleDragStart}
      onAddToClipboard={noop}
      shouldObscureFeed={shouldObscureFeed}
      metaContent={<ContentInfo>Recipe</ContentInfo>}
    />
  );
};

const mapStateToProps = (state: State) => ({
  shouldObscureFeed: selectFeatureValue(state, 'obscure-feed'),
});

export const RecipeFeedItem = connect(mapStateToProps)(RecipeFeedItemComponent);
