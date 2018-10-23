import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  wait,
  prettyDOM
} from 'react-testing-library';
import { HoverActionsButtonWrapper } from '../HoverActionButtonWrapper';
import {
  HoverDeleteButton,
  HoverViewButton,
  HoverOphanButton
} from '../HoverActionButtons';

afterAll(cleanup);

// Mocks //
const onDelete = () => {};
const article = {
  isLive: false,
  urlPath:
    'environment/2017/dec/14/a-different-dimension-of-loss-great-insect-die-off-sixth-extinction'
};

const { container, getByAltText, getByText, queryByText } = render(
  <HoverActionsButtonWrapper
    buttons={[
      { text: 'View', component: HoverViewButton },
      { text: 'Ophan', component: HoverOphanButton },
      { text: 'Delete', component: HoverDeleteButton }
    ]}
    buttonprops={{
      isLive: article.isLive,
      urlPath: article.urlPath,
      onDelete
    }}
  />
);
const wrapper = container.firstChild;
const viewButtonIcon = getByAltText('View');
const deleteButtonIcon = getByAltText('Delete');

describe('Hover Action Button Wrapper', () => {
  it('should render Wrapper with correct Buttons', () => {
    expect(wrapper).toBeTruthy();
    if (wrapper) {
      expect(wrapper.childNodes.length).toEqual(2);
    }
    expect(viewButtonIcon).toBeTruthy();
    expect(deleteButtonIcon).toBeTruthy();
  });
});

describe('Hover Action Button ToolTip', () => {
  it('should display correct tool tip on mouse enter', () => {
    const button = viewButtonIcon.parentNode;
    if (button) {
      fireEvent.mouseEnter(button as HTMLButtonElement);
    }
    return waitForElement(() => getByText('View')).then(tooltip => {
      expect(tooltip).toBeTruthy();
    });
  });
  it('should hide tool tip on mouse leave', () => {
    const button = viewButtonIcon.parentNode;
    if (button) {
      fireEvent.mouseLeave(button as HTMLButtonElement);
    }
    return wait(() => expect(queryByText('View')).toBeNull());
  });
});
