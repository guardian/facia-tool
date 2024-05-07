import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  wait,
} from 'react-testing-library';
import { HoverActionsButtonWrapper } from '../HoverActionButtonWrapper';
import {
  HoverDeleteButton,
  HoverViewButton,
  HoverOphanButton,
} from '../HoverActionButtons';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../../constants/theme';
import { noop } from 'lodash';

afterEach(cleanup);

const HoverWrapper = (
  <ThemeProvider theme={theme}>
    <HoverActionsButtonWrapper toolTipPosition={'top'} toolTipAlign={'center'}>
      {(props) => (
        <>
          <HoverViewButton hoverText="View" href={'test-string'} {...props} />
          <HoverOphanButton {...props} hoverText="Ophan" />
          <HoverDeleteButton onDelete={noop} hoverText="Delete" {...props} />
        </>
      )}
    </HoverActionsButtonWrapper>
  </ThemeProvider>
);

// Tests //
describe('Hover Action Button Wrapper', () => {
  it('should render Wrapper with Buttons', () => {
    const { container, getByTitle } = render(HoverWrapper);
    const wrapper = container.firstChild as ChildNode;
    expect(wrapper).toBeTruthy();
    expect(wrapper.childNodes.length).toEqual(3);
    expect(getByTitle('view')).toBeTruthy();
    expect(getByTitle('ophan')).toBeTruthy();
    expect(getByTitle('delete')).toBeTruthy();
  });

  it('should render Wrapper without Ophan Button when Draft', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <HoverActionsButtonWrapper
          toolTipPosition={'top'}
          toolTipAlign={'center'}
        >
          {(props) => (
            <>
              <HoverViewButton
                hoverText="View"
                href={'test-string'}
                {...props}
              />
              <HoverOphanButton {...props} hoverText="Ophan" />
              <HoverDeleteButton
                onDelete={noop}
                hoverText="Delete"
                {...props}
              />
            </>
          )}
        </HoverActionsButtonWrapper>
      </ThemeProvider>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.childNodes.length).toEqual(2);
    // TODO explicitly check ophanButton is NOT rendered using queryByAltText - solve TS error in testing library
    const ophanButton = wrapper.querySelector(
      '[data-testid="ophan-hover-button"]'
    );
    expect(ophanButton).toBeFalsy();
  });
});

describe('Hover Action Button ToolTip', () => {
  it('should display correct tool tip on mouseEnter', async () => {
    const { getByTitle, getByText } = render(HoverWrapper);
    const button = getByTitle('ophan').parentNode as HTMLButtonElement;
    fireEvent.mouseEnter(button);
    const ToolTip = await waitForElement(() => getByText('ophan'));
    expect(ToolTip).toBeTruthy();
  });

  it('should hide tool tip on mouseLeave', () => {
    const { getByTitle, queryByText } = render(HoverWrapper);
    const button = getByTitle('view').parentNode as HTMLButtonElement;
    fireEvent.mouseLeave(button);
    wait(() => expect(queryByText('view')).toBeFalsy());
  });
});
