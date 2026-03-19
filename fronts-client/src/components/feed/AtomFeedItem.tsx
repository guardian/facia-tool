import React from 'react';
import { connect } from 'react-redux';
import { CapiInteractiveAtom, isCapiInteractiveAtom } from 'types/Capi';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { selectArticleAcrossResources } from 'bundles/capiFeedBundle';
import { FeedItem } from './FeedItem';
import { ContentInfo } from './ContentInfo';
import { CardTypesMap } from 'constants/cardTypes';
import {
	dragOffsetX,
	dragOffsetY,
} from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import { insertCardWithCreate } from 'actions/Cards';

interface ContainerProps {
	id: string;
}

interface ComponentProps extends ContainerProps {
	atom?: CapiInteractiveAtom;
	onAddToClipboard: (atom: CapiInteractiveAtom) => void;
}

const AtomFeedItemComponent = ({
	atom,
	id,
	onAddToClipboard,
}: ComponentProps) => {
	if (!atom) {
		return <p>Atom with id {id} not found.</p>;
	}

	const handleDragStart = (
		event: React.DragEvent<HTMLDivElement>,
		dragNode: HTMLDivElement,
	) => {
		event.dataTransfer.setData('interactive-atom', JSON.stringify(atom));
		if (dragNode) {
			event.dataTransfer.setDragImage(dragNode, dragOffsetX, dragOffsetY);
		}
	};

	const atomUrl = `https://www.theguardian.com/${atom.id}`;

	return (
		<FeedItem
			type={CardTypesMap.INTERACTIVE_ATOM}
			id={atom.id}
			title={atom.data.interactive.title}
			urlPath={atom.id}
			liveUrl={atomUrl}
			thumbnail={undefined}
			hasVideo={false}
			isLive={true}
			onAddToClipboard={() => onAddToClipboard(atom)}
			handleDragStart={handleDragStart}
			metaContent={<ContentInfo>Interactive atom</ContentInfo>}
		/>
	);
};

const mapStateToProps = (state: State, { id }: ContainerProps) => {
	const resource = selectArticleAcrossResources(state, id);
	return {
		atom: resource && isCapiInteractiveAtom(resource) ? resource : undefined,
	};
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
	onAddToClipboard: (atom: CapiInteractiveAtom) =>
		dispatch(
			insertCardWithCreate(
				{ type: 'clipboard', id: 'clipboard', index: 0 },
				{ type: 'CAPI', data: atom as any },
				'clipboard',
			),
		),
});

export const AtomFeedItem = connect(
	mapStateToProps,
	mapDispatchToProps,
)(AtomFeedItemComponent);
