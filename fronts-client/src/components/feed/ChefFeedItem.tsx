import { Chef } from '../../types/Chef';
import React from 'react';
import {
  dragOffsetX,
  dragOffsetY,
} from '../FrontsEdit/CollectionComponents/ArticleDrag';
import { FeedItem } from './FeedItem';
import { ContentInfo } from './ContentInfo';
import { selectFeatureValue } from '../../selectors/featureSwitchesSelectors';
import { State } from '../../types/State';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import { CardTypesMap } from 'constants/cardTypes';

interface ComponentProps {
  chef: Chef;
  shouldObscureFeed: boolean;
}

export const ChefFeedItemComponent = ({
  chef,
  shouldObscureFeed,
}: ComponentProps) => {
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    dragNode: HTMLDivElement
  ) => {
    event.dataTransfer.setData('chef', JSON.stringify(chef));
    if (dragNode) {
      event.dataTransfer.setDragImage(dragNode, dragOffsetX, dragOffsetY);
    }
  };

  return (
    <FeedItem
      id={chef.id}
      type={CardTypesMap.CHEF}
      title={`${chef.firstName} ${chef.lastName}`}
      hasVideo={false}
      isLive={true}
      liveUrl={`https://theguardian.com/${chef.apiUrl}`}
      thumbnail={chef.bylineLargeImageUrl}
      onAddToClipboard={noop}
      handleDragStart={handleDragStart}
      shouldObscureFeed={shouldObscureFeed}
      metaContent={<ContentInfo>Chef</ContentInfo>}
    />
  );
};

const mapStateToProps = (state: State) => ({
  shouldObscureFeed: selectFeatureValue(state, 'obscure-feed'),
});

export const ChefFeedItem = connect(mapStateToProps)(ChefFeedItemComponent);
