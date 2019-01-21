import React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';
import DragIntentContainer from '../DragIntentContainer';

afterEach(cleanup);
jest.useFakeTimers();

describe('DragIntentContainer', () => {
  it('should fire onIntentConfirm callback 300ms after Drag has entered', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const DragIntent = (
      <DragIntentContainer
        onIntentConfirm={callback2}
        onDragIntentStart={callback1}
        onDragIntentEnd={() => {}}
        active={true}
      >
        <span>
          <span>Child</span>
        </span>
      </DragIntentContainer>
    );
    const { getByText } = render(DragIntent);
    expect(callback1).not.toBeCalled();
    expect(callback2).not.toBeCalled();
    fireEvent.dragEnter(getByText('Child'));
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toBeCalled();
    jest.runOnlyPendingTimers();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
  it('should not fire onIntentConfirm callback after 300ms if Drag has left', () => {
    const callback = jest.fn();
    const DragIntent = (
      <DragIntentContainer
        onIntentConfirm={callback}
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
    expect(callback).not.toBeCalled();
    fireEvent.dragEnter(getByText('Child'));
    fireEvent.dragLeave(getByText('Child'));
    jest.runOnlyPendingTimers();
    expect(callback).toHaveBeenCalledTimes(0);
  });
  it('should reset DragIntent on Drop', () => {
    const callback = jest.fn();
    const DragIntent = (
      <DragIntentContainer
        onIntentConfirm={() => {}}
        onDragIntentStart={() => {}}
        onDragIntentEnd={callback}
        active={true}
      >
        <span>
          <span>Child</span>
        </span>
      </DragIntentContainer>
    );
    const { getByText } = render(DragIntent);
    fireEvent.dragEnter(getByText('Child'));
    expect(callback).not.toBeCalled();
    fireEvent.drop(getByText('Child'));
    jest.runOnlyPendingTimers();
    expect(callback).toHaveBeenCalledTimes(1);
  });
  it('should reset DragIntent when onIntentConfirm callback fired', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const DragIntent = (
      <DragIntentContainer
        onIntentConfirm={callback1}
        onDragIntentStart={() => {}}
        onDragIntentEnd={callback2}
        active={true}
      >
        <span>
          <span>Child</span>
        </span>
      </DragIntentContainer>
    );
    const { getByText } = render(DragIntent);
    fireEvent.dragEnter(getByText('Child'));
    expect(callback1).not.toBeCalled();
    jest.runOnlyPendingTimers();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });
  it('should do nothing on Drag events if Active prop is false', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const DragIntent = (
      <DragIntentContainer
        onIntentConfirm={callback2}
        onDragIntentStart={callback1}
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
    expect(callback1).not.toBeCalled();
    expect(callback2).not.toBeCalled();
  });
});
