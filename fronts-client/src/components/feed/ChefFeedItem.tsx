import { Chef } from '../../types/Chef';
import React, { useCallback } from 'react';
import {
  dragOffsetX,
  dragOffsetY,
} from '../FrontsEdit/CollectionComponents/ArticleDrag';
import { FeedItem } from './FeedItem';
import { ContentInfo } from './ContentInfo';
import { selectFeatureValue } from '../../selectors/featureSwitchesSelectors';
import { State } from '../../types/State';
import { CardTypesMap } from 'constants/cardTypes';
import { connect, useDispatch } from 'react-redux';
import { insertCardWithCreate } from '../../actions/Cards';

interface ComponentProps {
  chef: Chef;
  shouldObscureFeed: boolean;
}

export const ChefFeedItemComponent = ({
  chef,
  shouldObscureFeed,
}: ComponentProps) => {
  const dispatch = useDispatch();

  const onAddToClipboard = useCallback(() => {
    dispatch<any>(
      insertCardWithCreate(
        { type: 'clipboard', id: 'clipboard', index: 0 },
        { type: 'CHEF', data: chef },
        'clipboard'
      )
    );
  }, [chef]);

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
      onAddToClipboard={onAddToClipboard}
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
