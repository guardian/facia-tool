import React from 'react';
import { connect } from 'react-redux';
import { styled, theme } from 'constants/theme';
import type { State } from 'types/State';
import { FrontConfig } from 'types/FaciaApi';
import CollectionOverview from './CollectionOverview';
import { CardSets } from 'types/Collection';
import ContainerHeadingPinline from 'components/typography/ContainerHeadingPinline';
import ContentContainer from 'components/layout/ContentContainer';
import { editorClearCardSelection } from 'bundles/frontsUI';
import { bindActionCreators } from 'redux';
import { Dispatch } from 'types/Store';
import { selectFront } from '../../selectors/shared';
import {
	ListBox,
	ListBoxItem,
	useDragAndDrop,
	isTextDropItem,
} from 'react-aria-components';
import {
	moveFrontCollection,
	addExistingFrontCollection,
} from 'actions/Collections';
import { reorderIndex } from 'util/reorderIndex';
import { collection } from 'fixtures/shared';

interface FrontContainerProps {
	id: string;
}

type FrontCollectionOverviewProps = FrontContainerProps & {
	front: FrontConfig;
	browsingStage: CardSets;
	currentCollection: string | undefined;
	moveFrontCollection: (
		frontId: string,
		collectionId: string,
		direction: undefined,
		position: number,
	) => void;
	addExistingFrontCollection: (
		frontId: string,
		collectionId: string,
		position: number,
	) => void;
};

interface ContainerProps {
	isClosed: boolean;
}

const Container = styled(ContentContainer)<ContainerProps>`
	border: ${({ isClosed }) =>
		isClosed ? `1px solid ${theme.base.colors.borderColor}` : 'none'};
	border-top: none;
	display: flex;
	flex-direction: column;
	flex: 1;
	margin-left: 10px;
	max-height: calc(100% - 43px);
	overflow-y: scroll;
	padding: 0;
	${({ isClosed }) => (isClosed ? 'padding: 0; height: 100%' : '')}
`;

const ContainerBody = styled.div`
	width: ${theme.front.overviewMinWidth}px;
	padding-bottom: ${theme.front.paddingForAddFrontButton}px;

	.react-aria-ListBox {
		list-style: none;
		margin: 0;
		padding: 0;
		outline: none;
	}

	.react-aria-ListBoxItem {
		list-style: none;
		outline: none;
	}

	.react-aria-ListBoxItem[data-dragging] {
		opacity: 0.4;
	}

	.react-aria-DropIndicator {
		height: 2px;
	}

	.react-aria-DropIndicator[data-drop-target] {
		outline: 2px solid ${theme.base.colors.focusColor};
		border-radius: 2px;
	}
`;

const OverviewContainerHeadingPinline = styled(ContainerHeadingPinline)`
	font-family: TS3TextSans;
	font-size: 15px;
	font-weight: bold;
	line-height: normal;
	padding-bottom: 5px;
`;

const FrontCollectionsOverview = ({
	id,
	front,
	browsingStage,
	currentCollection,
	moveFrontCollection,
	addExistingFrontCollection,
}: FrontCollectionOverviewProps) => {
	const { dragAndDropHooks } = useDragAndDrop({
		getItems: (keys) => [...keys].map((key) => ({ 'text/plain': String(key) })),
		onReorder(e) {
			const draggedId = String([...e.keys][0]);
			const newIndex = reorderIndex(front.collections, draggedId, e.target);
			moveFrontCollection(id, draggedId, undefined, newIndex);
		},
		async onInsert(e) {
			const textItem = e.items.find(isTextDropItem);
			if (!textItem) return;
			const collectionId = await textItem.getText('text/plain');
			if (front.collections.includes(collectionId)) return; // collection is already in the front, do not add again
			const targetIndex = front.collections.indexOf(String(e.target.key));
			const position =
				e.target.dropPosition === 'after' ? targetIndex + 1 : targetIndex;
			console.log(
				`Adding collection ${collectionId} to front ${id} at position ${position}`,
			);
			addExistingFrontCollection(id, collectionId, position);
		},
	});

	return (
		<Container setBack isClosed={false}>
			<OverviewContainerHeadingPinline>
				Overview
			</OverviewContainerHeadingPinline>
			<ContainerBody>
				<ListBox
					aria-label="Collections overview"
					items={front.collections.map((c) => ({ id: c }))}
					dragAndDropHooks={dragAndDropHooks}
					selectionMode="none"
				>
					{(item: { id: string }) => (
						<ListBoxItem id={item.id} textValue={item.id}>
							<CollectionOverview
								frontId={id}
								collectionId={item.id}
								isSelected={currentCollection === item.id}
								browsingStage={browsingStage}
							/>
						</ListBoxItem>
					)}
				</ListBox>
			</ContainerBody>
		</Container>
	);
};

const mapStateToProps = (state: State, props: FrontContainerProps) => ({
	front: selectFront(state, { frontId: props.id }),
});

const mapDispatchToProps = (dispatch: Dispatch) =>
	bindActionCreators(
		{
			clearCardSelection: editorClearCardSelection,
			moveFrontCollection,
			addExistingFrontCollection,
		},
		dispatch,
	);

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(FrontCollectionsOverview);
