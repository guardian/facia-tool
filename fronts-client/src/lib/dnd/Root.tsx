import React, { createContext } from 'react';
import AddParentInfo, { isMove, isInside } from './AddParentInfo';
import createStore, { Store } from './store';
import DragIntentContainer from 'components/DragIntentContainer';
import styled from 'styled-components';
import { DropZoneContainer } from './DropZone';

const { Provider: StoreProvider, Consumer: StoreConsumer } = createContext(
	null as Store | null,
);

interface OuterProps {
	id: string;
}

type Props = OuterProps & React.HTMLAttributes<HTMLDivElement>;

interface State {
	store: Store;
}

const classNameDraggedOver = 'DnD__Root--is-dragged-over';

const RootContainer = styled.div`
	display: contents;
	&.${classNameDraggedOver} {
		${DropZoneContainer} {
			pointer-events: initial;
		}
	}
`;

export default class DragAndDropRoot extends React.Component<Props, State> {
	public state = { store: createStore() };
	private rootRef = React.createRef<HTMLDivElement>();

	public render() {
		const { id, ...divProps } = this.props;

		return (
			<RootContainer ref={this.rootRef}>
				<DragIntentContainer
					onDragIntentStart={this.onDragOverStart}
					onDragIntentEnd={this.onDragOverEnd}
					{...divProps}
				>
					<StoreProvider value={this.state.store}>
						<AddParentInfo id={this.props.id} type="root">
							{this.props.children}
						</AddParentInfo>
					</StoreProvider>
				</DragIntentContainer>
			</RootContainer>
		);
	}

	private onDragOverStart = (e: React.DragEvent) => {
		if (!e.defaultPrevented) {
			this.setIsDraggedOver(true);
			this.reset();
		}
	};

	private onDragOverEnd = () => {
		this.setIsDraggedOver(false);
		this.reset();
	};

	private reset = () => {
		this.state.store.update(null, null, false);
	};

	/**
	 * This is an optimisation to prevent rerendering children when we
	 * alter a property on the RootContainer. If we used state to handle
	 * this attribute, we'd also rerender children when this property changed.
	 */
	private setIsDraggedOver = (isDraggedOver: boolean) => {
		if (!this.rootRef.current) {
			return;
		}
		if (isDraggedOver) {
			this.rootRef.current.classList.add(classNameDraggedOver);
		} else {
			this.rootRef.current.classList.remove(classNameDraggedOver);
		}
	};
}

export { StoreConsumer, isMove, isInside };
