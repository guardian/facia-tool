// @flow

import React from 'react';
import { shallow } from 'enzyme';
import { FrontsComponent } from '../FrontsEdit/Fronts';
import { frontsActions } from '../../mocks';
import { frontsClientConfig } from '../../fixtures';

import type { PriorityName } from '../../types/Fronts';
import type { FrontsComponentProps } from '../FrontsEdit/Fronts';

const selectors = {
  FRONTS_SELECT: 'select'
};

const setup = (priority: PriorityName) => {
  const props: FrontsComponentProps = Object.assign({
    frontsActions,
    priority,
    frontsConfig: frontsClientConfig
  });

  const wrapper = shallow(<FrontsComponent {...props} />);

  return {
    wrapper,
    fronts: wrapper.find(selectors.FRONTS_SELECT)
  };
};

describe('Fronts', () => {
  it('should render correctly', () => {
    const { wrapper } = setup('editorial');

    expect(wrapper.exists()).toBe(true);
  });

  it('should render editorial fronts', () => {
    const { fronts } = setup('editorial');

    expect(fronts.text()).toMatch(/editorialFront/);
    expect(fronts.text()).toMatch(/(?<!\.commercialFront)/);
  });

  it('should render commercial fronts', () => {
    const { fronts } = setup('commercial');

    expect(fronts.text()).toMatch(/commercialFront/);
    expect(fronts.text()).toMatch(/(?<!\.editoriaFront)/);
  });
});
