import React from 'react';
import { render, cleanup } from 'react-testing-library';
import configureStore from 'util/configureStore';
import { Provider } from 'react-redux';
import { theme } from '../../../constants/theme';
import { ThemeProvider } from 'styled-components';
import 'jest-styled-components';
import { ChefCard } from '../chef/ChefCard';

const chefFixture = {
  backgroundHex: '#20809E',
  id: 'profile/yotamottolenghi',
  image:
    'https://media.guim.co.uk/266825657a291ab9c1c0b798a0391f827b6c53ec/93_150_907_907/500.jpg',
  bio: 'Inspiration and global flavours for special occasions',
  foregroundHex: '#F9F9F5',
};

describe('ChefCard', () => {
  afterEach(cleanup);

  it('should render a chef', async () => {
    const store = configureStore({
      feed: {},
      cards: {
        'test-chef-card': {
          id: 'test-chef-id',
        },
      },
      chefs: {
        data: {
          'test-chef-id': chefFixture,
        },
      },
    });

    const component = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ChefCard
            onDelete={jest.fn()}
            onAddToClipboard={jest.fn()}
            id="test-chef-card"
            frontId="test-chef-id"
          />
        </ThemeProvider>
      </Provider>
    );

    const headline = await component.findAllByTestId('headline');
    expect(headline).toHaveLength(1);
    expect(headline[0].textContent).toEqual(
      'Inspiration and global flavours for special occasions'
    );
  });
});
