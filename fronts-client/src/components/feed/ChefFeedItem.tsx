import { Chef } from '../../types/Chef';
import React, { useCallback } from 'react';
import { FeedItem } from './FeedItem';
import { ContentInfo } from './ContentInfo';
import { selectFeatureValue } from '../../selectors/featureSwitchesSelectors';
import { State } from '../../types/State';
import { CardTypesMap } from 'constants/cardTypes';
import { connect, useDispatch, useSelector } from 'react-redux';
import { insertCardWithCreate } from '../../actions/Cards';
import { selectors as chefSelectors } from 'bundles/chefsBundle';
import { handleDragStartForCard } from 'util/dragAndDrop';

interface ComponentProps {
	id: string;
	shouldObscureFeed: boolean;
}

export const ChefFeedItemComponent = ({
	id,
	shouldObscureFeed,
}: ComponentProps) => {
	const chef: Chef = useSelector(
		(state) => chefSelectors.selectById(state, id)!,
	);
	const dispatch = useDispatch();

	const onAddToClipboard = useCallback(() => {
		dispatch<any>(
			insertCardWithCreate(
				{ type: 'clipboard', id: 'clipboard', index: 0 },
				{ type: 'CHEF', data: chef },
				'clipboard',
			),
		);
	}, [chef]);

	return (
		<FeedItem
			id={chef.id}
			type={CardTypesMap.CHEF}
			title={chef.internalName}
			hasVideo={false}
			isLive={true}
			liveUrl={`https://theguardian.com/${chef.apiUrl}`}
			thumbnail={chef.bylineLargeImageUrl}
			onAddToClipboard={onAddToClipboard}
			handleDragStart={handleDragStartForCard(CardTypesMap.CHEF, chef)}
			shouldObscureFeed={shouldObscureFeed}
			metaContent={<ContentInfo>Chef</ContentInfo>}
		/>
	);
};

const mapStateToProps = (state: State) => ({
	shouldObscureFeed: selectFeatureValue(state, 'obscure-feed'),
});

export const ChefFeedItem = connect(mapStateToProps)(ChefFeedItemComponent);
