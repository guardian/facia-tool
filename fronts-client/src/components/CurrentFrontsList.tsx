import React from 'react';
import startCase from 'lodash/startCase';
import { connect } from 'react-redux';
import {
	DragDropContext,
	Droppable,
	Draggable,
	DropResult,
} from 'react-beautiful-dnd';
import type { State } from 'types/State';
import { Dispatch } from 'types/Store';
import {
	editorMoveFront,
	createSelectEditorFrontsByPriority,
} from 'bundles/frontsUI';
import { FrontConfig } from 'types/FaciaApi';
import { styled, theme } from 'constants/theme';
import { scrollToLeft } from 'util/scroll';
import { frontsContainerId, createFrontId } from 'util/editUtils';

interface ComponentProps {
	moveFront: (dropResult: DropResult) => void;
	fronts: FrontConfig[];
}

const FrontTabList = styled.div<{ isDraggingOver?: boolean }>`
	background-color: ${({ isDraggingOver }) =>
		isDraggingOver ? theme.colors.greyMedium : theme.colors.greyMediumDark};
	position: absolute;
	height: 60px;
	line-height: 60px;
	width: calc(100vw - 120px);
	transition: background-color 0.15s;
	white-space: nowrap;
	overflow-x: auto;
	overflow-y: hidden;
`;

const NoFronts = styled(FrontTabList)`
	padding-left: 10px;
	font-family: TS3TextSans;
	font-size: 14px;
`;

const FrontTab = styled.div<{ isDragging: boolean }>`
	display: inline-block;
	max-width: 250px;
	vertical-align: top;
	height: 100%;
	line-height: 60px;
	padding: 0 22px;
	font-size: 16px;
	overflow: hidden;
	text-overflow: ellipsis;
	background-color: ${({ isDragging }) =>
		isDragging ? theme.colors.blackDark : theme.colors.greyMediumDark};
	& + & {
		box-shadow: -1px 0 0 0
			${({ isDragging }) =>
				isDragging ? 'transparent' : theme.colors.greyMedium};
	}
	&:hover {
		background-color: ${theme.colors.greyMedium};
	}
`;

class Component extends React.Component<ComponentProps> {
	public render() {
		if (!this.props.fronts.length) {
			return <NoFronts>There are no open fronts.</NoFronts>;
		}
		return (
			<DragDropContext onDragEnd={this.props.moveFront}>
				<Droppable droppableId="front-list" direction="horizontal">
					{(dropProvided, dropSnapshot) => (
						<FrontTabList
							ref={dropProvided.innerRef}
							isDraggingOver={dropSnapshot.isDraggingOver}
							{...dropProvided.droppableProps}
						>
							{this.props.fronts.map((front, index) => (
								<Draggable key={front.id} draggableId={front.id} index={index}>
									{(provided, snapshot) => {
										const title = startCase(front.id);
										return (
											<FrontTab
												title={title}
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												style={provided.draggableProps.style}
												isDragging={snapshot.isDragging}
												key={front.id}
												onClick={() => this.scrollToFront(front.id)}
											>
												{title}
											</FrontTab>
										);
									}}
								</Draggable>
							))}
							{dropProvided.placeholder}
						</FrontTabList>
					)}
				</Droppable>
			</DragDropContext>
		);
	}
	private scrollToFront(frontId: string) {
		const frontElement = document.getElementById(createFrontId(frontId));
		const frontContainerElement = document.getElementById(frontsContainerId);
		if (!frontElement || !frontContainerElement) {
			return;
		}
		// We can't use scrollIntoView here, as the fronts container is
		// translated, and this results in odd behaviour. Instead, we use
		// this function to scroll imperatively.
		scrollToLeft(frontContainerElement, frontElement.offsetLeft, 300);
	}
}

const mapStateToProps = () => {
	const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
	return (state: State) => ({
		fronts: selectEditorFrontsByPriority(state),
	});
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
	moveFront: (dropResult: DropResult) =>
		dropResult.destination &&
		dispatch(
			editorMoveFront(dropResult.draggableId, dropResult.destination.index),
		),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
