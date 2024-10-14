import React from 'react';
import { PathConsumer, Parent } from './AddParentInfo';
import { CARD_TYPE, TRANSFER_TYPE } from './constants';

interface ChildrenProps {
	draggable: true;
	onDragStart?: (e: React.DragEvent) => void;
}

interface OuterProps<T> {
	children: (
		getProps: (forceClone: boolean) => ChildrenProps,
	) => React.ReactNode;
	dropType?: string;
	renderDrag?: (data: T) => React.ReactNode;
	dragImageOffsetX?: number;
	dragImageOffsetY?: number;
	type: string;
	id: string;
	index: number;
	data: T;
}

interface ConextProps {
	parents: Parent[];
}

type Props<T> = OuterProps<T> & ConextProps;

class Node<T> extends React.Component<Props<T>> {
	public dragImage: HTMLDivElement | null = null;

	public render() {
		const { renderDrag, data } = this.props;
		return (
			<>
				{renderDrag && (
					<div
						style={{
							position: 'absolute',
							transform: 'translateX(-9999px)',
						}}
						ref={(node) => {
							this.dragImage = node;
						}}
					>
						{renderDrag(data)}
					</div>
				)}
				{this.props.children((forceClone) => ({
					draggable: true,
					onDragStart: this.onDragStart(forceClone),
				}))}
			</>
		);
	}

	private onDragStart = (forceClone: boolean) => (e: React.DragEvent) => {
		if (e.dataTransfer.getData(TRANSFER_TYPE)) {
			return;
		}
		if (this.dragImage) {
			const { dragImageOffsetX = 10, dragImageOffsetY = 10 } = this.props;
			e.dataTransfer.setDragImage(
				this.dragImage,
				dragImageOffsetX,
				dragImageOffsetY,
			);
		}
		const { parents, type, id, index, data, dropType } = this.props;
		e.dataTransfer.setData(
			TRANSFER_TYPE,
			JSON.stringify({ parents, type, id, index, data, forceClone }),
		);

		if (dropType) {
			e.dataTransfer.setData(CARD_TYPE, dropType);
		}
	};
}

export { ChildrenProps };

export default <T extends any>(props: OuterProps<T>) => (
	<PathConsumer>
		{(parents: Parent[]) => <Node {...props} parents={parents} />}
	</PathConsumer>
);
