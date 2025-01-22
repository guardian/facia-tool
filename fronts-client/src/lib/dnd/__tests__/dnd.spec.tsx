import React from 'react';
import TestRenderer from 'react-test-renderer';
import DragAndDropRoot from '../Root';
import Level from '../Level';

const createDragEvent = (top: boolean) => {
	const data: { [k: string]: any } = {};
	const types: string[] = [];
	let defaultPrevented = false;

	return {
		_data: data,
		get defaultPrevented() {
			return defaultPrevented;
		},
		preventDefault: () => {
			defaultPrevented = true;
		},
		currentTarget: {
			getBoundingClientRect: () => ({
				top: 0,
				height: 10,
			}),
		},
		clientY: top ? 1 : 9,
		dataTransfer: {
			get types() {
				return types.slice();
			},
			setData: (key: string, val: any) => {
				data[key] = val;
				types.push(key);
			},
			getData: (key: string) => data[key],
		},
	};
};

const runDrag =
	(type: any, data?: any, json: boolean = true) =>
	(dropProps: any, top = true) => {
		const e = createDragEvent(top);

		if (typeof type === 'string') {
			e.dataTransfer.setData(type, json ? JSON.stringify(data) : data);
		} else {
			// type is actually dragProps
			type.onDragStart(e);
		}

		if (dropProps.onDrop) {
			dropProps.onDrop(e);
		}
	};

const setup = (jsx: React.ReactElement<any>) =>
	TestRenderer.create(jsx).getInstance();

describe('Curation', () => {
	it('creates MOVE events from dragged nodes', () => {
		let nodeProps;
		let dropProps;
		let edit: any;

		let customArr = {
			id: '1',
		};
		setup(
			<DragAndDropRoot id="@@ROOT">
				<Level
					arr={[customArr]}
					type="a"
					parentType="b"
					parentId="0"
					getId={({ id }) => id}
					onMove={() => null}
					onDrop={() => null}
					renderDrop={() => null}
				>
					{(child, getDragProps, i) => {
						if (i === 0) {
							nodeProps = getDragProps();
						}

						return (
							<Level
								arr={[{ id: '3' }, { id: '4' }]}
								type="a"
								parentType="a"
								parentId={child.id}
								getId={({ id }) => id}
								onMove={(e) => {
									edit = e;
								}}
								onDrop={() => null}
								renderDrop={(getDropProps) => {
									if (getDropProps.index === 1) {
										dropProps = getDropProps;
									}
									return null;
								}}
							>
								{() => null}
							</Level>
						);
					}}
				</Level>
			</DragAndDropRoot>,
		);

		runDrag(nodeProps)(dropProps);

		expect(edit).toEqual({
			data: { id: '1' },
			from: { type: 'b', id: '0', index: 0 },
			to: { type: 'a', id: '2', index: 1 },
		});
	});

	it('allows dropping on to nodes when renderDrop is defined', () => {
		let nodeProps;
		let dropProps;
		let edit: any;

		setup(
			<DragAndDropRoot id="@@ROOT">
				<Level
					arr={[{ id: '1' }, { id: '2' }]}
					type="a"
					parentType="b"
					parentId="0"
					getId={({ id }) => id}
					onMove={() => null}
					onDrop={() => null}
					renderDrop={() => null}
				>
					{(child, getDragProps, i) => {
						if (i === 0) {
							nodeProps = getDragProps();
						}

						return (
							<Level
								arr={[{ id: '3' }, { id: '4' }]}
								type="a"
								parentType="a"
								parentId={child.id}
								getId={({ id }) => id}
								onMove={(e) => {
									edit = e;
								}}
								onDrop={() => null}
								renderDrop={() => null}
							>
								{(_, getNodeProps, j) =>
									j === 0 ? ((dropProps = getNodeProps()), null) : null
								}
							</Level>
						);
					}}
				</Level>
			</DragAndDropRoot>,
		);

		runDrag(nodeProps)(dropProps);

		expect(edit).toEqual({
			data: { id: '1' },
			from: { type: 'b', id: '0', index: 0 },
			to: { type: 'a', id: '2', index: 0 },
		});

		runDrag(nodeProps)(dropProps, false);
	});

	it('does not allow dropping on to nodes when canDrop is false', () => {
		let nodeProps;
		let dropProps;
		let edit: any;

		setup(
			<DragAndDropRoot id="@@ROOT">
				<Level
					arr={[{ id: '1' }, { id: '2' }]}
					type="a"
					parentType="b"
					parentId="0"
					getId={({ id }) => id}
					onMove={() => null}
					onDrop={() => null}
					renderDrop={() => null}
					canDrop={false}
				>
					{(child, getDragProps, i) => {
						if (i === 0) {
							nodeProps = getDragProps();
						}

						return (
							<Level
								arr={[{ id: '3' }, { id: '4' }]}
								type="a"
								parentType="a"
								parentId={child.id}
								getId={({ id }) => id}
								onMove={(e) => {
									edit = e;
								}}
								onDrop={() => null}
								canDrop={false}
							>
								{(_, getNodeProps, j) =>
									j === 0 ? ((dropProps = getNodeProps()), null) : null
								}
							</Level>
						);
					}}
				</Level>
			</DragAndDropRoot>,
		);

		runDrag(nodeProps)(dropProps);

		expect(edit).toBeUndefined();
	});

	it('creates INSERT events from arbitrary drops', () => {
		let dropProps;
		let event: any;
		let to: any;

		setup(
			<DragAndDropRoot id="@@ROOT">
				<Level
					arr={[{ id: '2' }]}
					parentId="1"
					parentType="b"
					getId={({ id }) => id}
					onMove={() => null}
					onDrop={() => null}
					renderDrop={() => null}
					type="a"
				>
					{() => (
						<Level
							arr={[{ id: '1' }]}
							type="a"
							parentId="2"
							parentType="a"
							getId={({ id }) => id}
							onMove={() => null}
							onDrop={(e, toSpec) => {
								event = e;
								to = toSpec;
							}}
							renderDrop={(getDropProps) => {
								dropProps = getDropProps;
								return null;
							}}
						>
							{() => null}
						</Level>
					)}
				</Level>
			</DragAndDropRoot>,
		);

		const data = {
			type: 'a',
			id: 2,
		};

		runDrag('text', {
			type: 'a',
			id: 2,
		})(dropProps);

		expect(JSON.parse(event.dataTransfer.getData('text'))).toEqual(data);
		expect(to).toEqual({ id: '2', index: 1, type: 'a' });
	});

	it('does not allow moves of a node to a subPath of that node', () => {
		let dragProps;
		let dropProps;
		let edit;

		setup(
			<DragAndDropRoot id="@@ROOT">
				<Level
					arr={[{ id: '2' }]}
					type="a"
					parentType="root"
					parentId="root"
					getId={({ id }) => id}
					onMove={() => null}
					onDrop={() => null}
					renderDrop={() => null}
				>
					{(_, getNodeProps) => {
						dragProps = getNodeProps();
						return (
							<Level
								arr={[{ id: '3' }]}
								type="a"
								parentType="a"
								getId={({ id }) => id}
								parentId="2"
								onMove={() => null}
								onDrop={(e) => {
									edit = e;
								}}
								renderDrop={(getDropProps) => {
									dropProps = getDropProps;
									return null;
								}}
							>
								{() => null}
							</Level>
						);
					}}
				</Level>
			</DragAndDropRoot>,
		);

		runDrag(dragProps)(dropProps);

		expect(edit).toBeUndefined();
	});

	it('adjusts move indices when moving things that affect the drop index', () => {
		let dragProps;
		let dropProps;
		let edit: any;

		setup(
			<DragAndDropRoot id="@@ROOT">
				<Level
					parentType="root"
					parentId="root"
					type="b"
					getId={({ id }) => id}
					arr={[{ id: '1' }, { id: '2' }, { id: '3' }]}
					onMove={(e) => {
						edit = e;
					}}
					onDrop={() => null}
					renderDrop={(getDropProps) => {
						dropProps = getDropProps;
						return null;
					}}
				>
					{(child, getNodeProps, i) => {
						if (i === 0) {
							dragProps = getNodeProps();
						}

						return false;
					}}
				</Level>
			</DragAndDropRoot>,
		);

		runDrag(dragProps)(dropProps);

		expect(edit.to.index).toBe(2);
	});

	it('does not create MOVE events when moves will have no impact', () => {
		let dragProps;
		let dropProps;
		let edit: any;

		setup(
			<DragAndDropRoot id="@@ROOT">
				<Level
					arr={[{ id: '1' }]}
					parentType="root"
					parentId="root"
					getId={({ id }) => id}
					type="a"
					onMove={(e) => {
						edit = e;
					}}
					onDrop={() => null}
					renderDrop={(getDropProps) => {
						dropProps = getDropProps;
						return null;
					}}
				>
					{(child, getNodeProps) => {
						dragProps = getNodeProps();
						return null;
					}}
				</Level>
			</DragAndDropRoot>,
		);

		runDrag(dragProps)(dropProps);

		expect(edit).toBeUndefined();
	});

	it('does not creates MOVE events without a `from` when forceClone arg is passed to getNodeProps', () => {
		let dragProps;
		let dropProps;
		let edit: any;

		setup(
			<DragAndDropRoot id="@@ROOT">
				<Level
					arr={[{ id: '1' }]}
					parentType="root"
					parentId="root"
					getId={({ id }) => id}
					type="a"
					onMove={(e) => {
						edit = e;
					}}
					onDrop={() => null}
					renderDrop={(getDropProps) => {
						dropProps = getDropProps;
						return null;
					}}
				>
					{(child, getNodeProps) => {
						dragProps = getNodeProps(true);
						return null;
					}}
				</Level>
			</DragAndDropRoot>,
		);

		runDrag(dragProps)(dropProps);

		expect(edit.from).toBe(false);
	});

	it('creates inserts between roots', () => {
		let nodeProps;
		let dropProps;
		let edit: any;

		setup(
			<div>
				<DragAndDropRoot id="@@ROOT">
					<Level
						type="a"
						getId={({ id }) => id}
						parentType="root"
						parentId="1"
						renderDrop={() => null}
						onMove={() => null}
						onDrop={() => null}
						arr={[{ id: '1' }]}
					>
						{(child, getNodeProps) => {
							nodeProps = getNodeProps();
							return null;
						}}
					</Level>
				</DragAndDropRoot>
				<DragAndDropRoot id="@@ROOT2">
					<Level
						type="a"
						getId={({ id }) => id}
						parentType="root"
						parentId="1"
						arr={[{ id: '2' }, { id: '3' }]}
						onMove={(e) => {
							edit = e;
						}}
						onDrop={() => null}
						renderDrop={(getDropProps) => {
							dropProps = getDropProps;
							return null;
						}}
					>
						{() => null}
					</Level>
				</DragAndDropRoot>
			</div>,
		);

		runDrag(nodeProps)(dropProps);

		expect(edit.from).toBe(false);
	});
});
