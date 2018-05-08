// @flow

import React from 'react';
import { shallow } from 'enzyme';
import { createMemoryHistory } from 'history';
import FrontsDropdown from '../FrontsEdit/FrontsDropdown';
import { frontsClientConfig } from '../../fixtures/frontsConfig';

import type { PriorityName } from 'Types/Priority';
import type { Props } from '../FrontsEdit/FrontsDropdown';

const setup = (priority: PriorityName, frontId: ?string) => {
  const history = createMemoryHistory(`/{priority`);
  const props: Props = Object.assign({
    priority,
    frontId,
    fronts: frontsClientConfig.fronts,
    history
  });

  const wrapper = shallow(<FrontsDropdown {...props} />);

  return {
    wrapper
  };
};

describe('FrontsDropdown', () => {
  it('should render correctly', () => {
    const { wrapper } = setup('editorial');

    expect(wrapper.exists()).toBe(true);
  });
});
