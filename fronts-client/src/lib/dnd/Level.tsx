import React from 'react';
import Node, { ChildrenProps as NodeChildrenProps } from './Node';
import { StoreConsumer, isMove, isInside } from './Root';
import { Store } from './store';
import AddParentInfo, { PathConsumer, Parent } from './AddParentInfo';
import { TRANSFER_TYPE, NO_STORE_ERROR } from './constants';
import DropZone from './DropZone';

interface PosSpec {
	type: string;
	id: string;
	index: number;
	collectionId?: string;
	groupName?: string;
	groupIds?: string[];
	cards?: any[];
}

const isOnSameLevel = (from: PosSpec, to: PosSpec): boolean =>
	from.type === to.type && from.id === to.id;

const adjustToIndexForMove = (from: PosSpec, to: PosSpec): PosSpec =>
	isOnSameLevel(from, to) && to.index > from.index
		? { ...to, index: to.index - 1 }
		: to;

const isMoveToSamePosition = (from: PosSpec, to: PosSpec): boolean =>
	isOnSameLevel(from, to) && from.index === to.index;

interface Move<T> {
	data: T;
	from: false | PosSpec;
	to: PosSpec;
}

interface DropProps {
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	index: number;
	length: number;
	isTarget: boolean;
}

type LevelChild<T> = (
	node: T,
	getProps: (forceClone?: boolean) => Partial<DropProps> & NodeChildrenProps,
	index: number,
	arr: T[],
) => React.ReactNode;

type MoveHandler<T> = (move: Move<T>) => void;
type DropHandler = (e: React.DragEvent, to: PosSpec) => void;
type ContainerDragTypes = Pick<
	React.DOMAttributes<HTMLDivElement>,
	'onDragOver'
>;

export interface LevelProps<T> {
	arr: T[];
	children: LevelChild<T>;
	parentId: string;
	parentType: string;
	collectionId: string;
	groupName?: string;
	groupIds?: string[];
	type: string;
	getDropType?: (item: T) => string;
	dragImageOffsetX?: number;
	dragImageOffsetY?: number;
	canDrop?: boolean;
	getId: (t: T) => string;
	onMove: (move: Move<T>) => void;
	onDrop: (e: React.DragEvent, to: PosSpec) => void;
	renderDrag?: (data: T) => React.ReactNode;
	renderDrop?: (props: DropProps) => React.ReactNode | null;
	// If this function returns false, all dragging behaviour is bypassed.
	denyDragEvent?: (e: React.DragEvent) => boolean;
	containerElement?: React.ComponentType<ContainerDragTypes>;
}

interface ContextProps {
	store: Store | null;
	parents: Parent[];
}

type Props<T> = LevelProps<T> & ContextProps;

interface State {
	isDraggedOver: boolean;
}

const DefaultContainer: React.SFC<ContainerDragTypes> = ({
	children,
	...rest
}) => <div {...rest}>{children}</div>;

class Level<T> extends React.Component<Props<T>, State> {
	get key() {
		return `${this.props.parentId}:${this.props.parentType}`;
	}

	public render() {
		const {
			renderDrop = null,
			renderDrag,
			children,
			arr,
			getId,
			type,
			dragImageOffsetX,
			dragImageOffsetY,
			getDropType,
			store,
		} = this.props;
		const Container = this.props.containerElement || DefaultContainer;
		return (
			<Container onDragOver={this.onDragOver(null)}>
				{arr.map((node, i) => (
					<React.Fragment key={getId(node)}>
						<DropZone store={store} parentKey={this.key} index={i}>
							{(isTarget) =>
								renderDrop && renderDrop(this.getDropProps(arr, i, isTarget))
							}
						</DropZone>
						<Node
							renderDrag={renderDrag}
							dragImageOffsetX={dragImageOffsetX}
							dragImageOffsetY={dragImageOffsetY}
							id={getId(node)}
							type={type}
							dropType={getDropType?.(node)}
							index={i}
							data={node}
						>
							{(getNodeDragProps) =>
								children(
									node,
									this.getNodeDropProps(i, getNodeDragProps),
									i,
									arr,
								)
							}
						</Node>
					</React.Fragment>
				))}
				<DropZone store={store} parentKey={this.key} index={arr.length}>
					{(isTarget) =>
						renderDrop &&
						renderDrop(this.getDropProps(arr, arr.length, isTarget))
					}
				</DropZone>
			</Container>
		);
	}

	private denyDragEvent = (e: React.DragEvent) =>
		this.props.denyDragEvent?.(e) ?? false;

	private onDragOver = (i: number | null) => (e: React.DragEvent) => {
		if (!this.props.store) {
			throw new Error(NO_STORE_ERROR);
		}

		if (e.defaultPrevented || this.denyDragEvent(e)) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}

		e.preventDefault();
		this.props.store.update(this.key, i, true);
	};

	private onDrop = (i: number) => (e: React.DragEvent) => {
		if (e.defaultPrevented || this.denyDragEvent(e)) {
			return;
		}

		e.preventDefault();

		const { onMove = () => null, onDrop = () => null } = this.props;
		const af = e.dataTransfer.getData(TRANSFER_TYPE);

		const to = {
			index: i,
			type: this.props.parentType,
			id: this.props.parentId,
			collectionId: this.props.collectionId,
			groupName: this.props.groupName,
			groupIds: this.props.groupIds,
			cards: this.props.arr,
		};

		if (!af) {
			return onDrop(e, to);
		}

		const { parents, id, index, type, data, forceClone } = JSON.parse(af);

		if (!isInside(this.props.parents, [type, id])) {
			const [parentType, parentId] = parents[parents.length - 1];
			const from = !forceClone &&
				isMove(this.props.parents, parents) && {
					type: parentType,
					id: parentId,
					index,
				};

			const adjustedTo = from ? adjustToIndexForMove(from, to) : to;

			if (!(from && isMoveToSamePosition(from, adjustedTo))) {
				return onMove({ data, to: adjustedTo, from });
			}
		}
	};

	private getDropProps(arr: T[], index: number, isTarget: boolean): DropProps {
		return {
			onDragOver: this.onDragOver(index),
			onDrop: this.onDrop(index),
			isTarget,
			index,
			length: arr.length,
		};
	}

	private getNodeDropProps(
		i: number,
		getNodeDragProps: (forceClone: boolean) => NodeChildrenProps,
	) {
		const { canDrop = true } = this.props;
		return (forceClone = false) => ({
			...getNodeDragProps(forceClone),
			...(canDrop
				? { onDragOver: this.onDragOver(i), onDrop: this.onDrop(i) }
				: {}),
		});
	}
}

export default <T extends any>(props: LevelProps<T>) => (
	<StoreConsumer>
		{(store: Store | null) => (
			<AddParentInfo id={props.parentId} type={props.parentType}>
				<PathConsumer>
					{(parents: Parent[]) => (
						<Level
							{...props}
							key={props.parentId} // resubscribe to store if every changes (this might be too nuclear)
							parents={parents}
							store={store}
						/>
					)}
				</PathConsumer>
			</AddParentInfo>
		)}
	</StoreConsumer>
);

export { Move, PosSpec, LevelChild, MoveHandler, DropHandler };
