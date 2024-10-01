import React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';
import DragIntentContainer from '../DragIntentContainer';

afterEach(cleanup);
jest.useFakeTimers();

describe('DragIntentContainer', () => {
	it('should fire onIntentConfirm callback 300ms after Drag has entered', async () => {
		const onDragIntentStart = jest.fn();
		const onIntentConfirm = jest.fn();
		const DragIntent = (
			<DragIntentContainer
				delay={300}
				onIntentConfirm={onIntentConfirm}
				onDragIntentStart={onDragIntentStart}
				onDragIntentEnd={() => {}}
				active={true}
			>
				<span>
					<span>Child</span>
				</span>
			</DragIntentContainer>
		);
		const { getByText } = render(DragIntent);
		expect(onDragIntentStart).not.toBeCalled();
		expect(onIntentConfirm).not.toBeCalled();
		fireEvent.dragEnter(getByText('Child'));
		expect(onDragIntentStart).toHaveBeenCalledTimes(1);
		expect(onIntentConfirm).not.toBeCalled();
		jest.runOnlyPendingTimers();
		expect(onIntentConfirm).toHaveBeenCalledTimes(1);
	});
	it('should not fire onIntentConfirm callback after 300ms if Drag has left', () => {
		const onIntentConfirm = jest.fn();
		const DragIntent = (
			<DragIntentContainer
				delay={300}
				onIntentConfirm={onIntentConfirm}
				onDragIntentStart={() => {}}
				onDragIntentEnd={() => {}}
				active={true}
			>
				<span>
					<span>Child</span>
				</span>
			</DragIntentContainer>
		);
		const { getByText } = render(DragIntent);
		expect(onIntentConfirm).not.toBeCalled();
		fireEvent.dragEnter(getByText('Child'));
		fireEvent.dragLeave(getByText('Child'));
		jest.runOnlyPendingTimers();
		expect(onIntentConfirm).toHaveBeenCalledTimes(0);
	});
	it('should reset DragIntent on Drop', () => {
		const onDragIntentEnd = jest.fn();
		const DragIntent = (
			<DragIntentContainer
				delay={300}
				onIntentConfirm={() => {}}
				onDragIntentStart={() => {}}
				onDragIntentEnd={onDragIntentEnd}
				active={true}
			>
				<span>
					<span>Child</span>
				</span>
			</DragIntentContainer>
		);
		const { getByText } = render(DragIntent);
		fireEvent.dragEnter(getByText('Child'));
		expect(onDragIntentEnd).not.toBeCalled();
		fireEvent.drop(getByText('Child'));
		jest.runOnlyPendingTimers();
		expect(onDragIntentEnd).toHaveBeenCalledTimes(1);
	});
	it('should reset DragIntent when onIntentConfirm callback fired', () => {
		const onIntentConfirm = jest.fn();
		const onDragIntentEnd = jest.fn();
		const DragIntent = (
			<DragIntentContainer
				delay={300}
				onIntentConfirm={onIntentConfirm}
				onDragIntentStart={() => {}}
				onDragIntentEnd={onDragIntentEnd}
				active={true}
			>
				<span>
					<span>Child</span>
				</span>
			</DragIntentContainer>
		);
		const { getByText } = render(DragIntent);
		fireEvent.dragEnter(getByText('Child'));
		expect(onIntentConfirm).not.toBeCalled();
		jest.runOnlyPendingTimers();
		expect(onIntentConfirm).toHaveBeenCalledTimes(1);
		expect(onDragIntentEnd).toHaveBeenCalledTimes(1);
	});
	it('should do nothing on Drag events if Active prop is false', async () => {
		const onDragIntentStart = jest.fn();
		const onIntentConfirm = jest.fn();
		const DragIntent = (
			<DragIntentContainer
				delay={300}
				onIntentConfirm={onIntentConfirm}
				onDragIntentStart={onDragIntentStart}
				onDragIntentEnd={() => {}}
				active={false}
			>
				<span>
					<span>Child</span>
				</span>
			</DragIntentContainer>
		);
		const { getByText } = render(DragIntent);
		fireEvent.dragEnter(getByText('Child'));
		jest.runOnlyPendingTimers();
		expect(onDragIntentStart).not.toBeCalled();
		expect(onIntentConfirm).not.toBeCalled();
	});
	it('runs synchronously without delay', async () => {
		const onDragIntentStart = jest.fn();
		const onIntentConfirm = jest.fn();
		const DragIntent = (
			<DragIntentContainer
				onIntentConfirm={onIntentConfirm}
				onDragIntentStart={onDragIntentStart}
				onDragIntentEnd={() => {}}
				active={false}
			>
				<span>
					<span>Child</span>
				</span>
			</DragIntentContainer>
		);
		const { getByText } = render(DragIntent);
		fireEvent.dragEnter(getByText('Child'));
		expect(onDragIntentStart).not.toBeCalled();
		expect(onIntentConfirm).not.toBeCalled();
	});
});
