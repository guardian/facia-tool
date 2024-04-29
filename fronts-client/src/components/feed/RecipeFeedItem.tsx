import {Recipe} from "../../types/Recipe";
import {FeedItem} from "./FeedItem";
import React from "react";
import {dragOffsetX, dragOffsetY} from "../FrontsEdit/CollectionComponents/ArticleDrag";

interface ComponentProps {
  recipe: Recipe
}

export const RecipeFeedItem = ({ recipe }: ComponentProps) => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, dragNode: HTMLDivElement) => {
    event.dataTransfer.setData('recipe', JSON.stringify(recipe));
    if (dragNode) {
      event.dataTransfer.setDragImage(
        dragNode,
        dragOffsetX,
        dragOffsetY
      );
    }
  };

  return (
    <FeedItem
      title={recipe.title}
      thumbnail={recipe.featuredImage.url}
      liveUrl={`https://theguardian.com/${recipe.canonicalArticle}`}
      hasVideo={false}
      isLive={true} // We do not yet serve preview recipes
      handleDragStart={handleDragStart} />
  )
}
