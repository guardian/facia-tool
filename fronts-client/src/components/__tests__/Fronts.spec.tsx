import React from 'react';
import { shallow } from 'enzyme';
import Dropdown from '../inputs/Dropdown';

describe('Dropdown', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <Dropdown
        items={[
          {
            value: '1',
            label: 'one'
          }
        ]}
        onChange={() => {}}
      />
    );

    expect(wrapper.exists()).toBe(true);
  });
});
