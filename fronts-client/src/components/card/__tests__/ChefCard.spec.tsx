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
  webTitle: 'Yotam Ottolenghi',
};

describe('ChefCard', () => {
  afterEach(cleanup);

  it('should render a chef', async () => {
    const store = configureStore({
      feed: {},
      cards: {
        'test-chef-card': {
          id: 'test-chef-id',
          uuid: 'test-chef-card',
          meta: {
            chefTheme: {
              id: 'test-chef-theme-id',
              palette: {},
            },
          },
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
    expect(headline[0].textContent).toContain('Yotam Ottolenghi');

    const metacontainer = await component.findAllByTestId('meta-container');
    expect(metacontainer).toHaveLength(1);
    expect(metacontainer[0]).toHaveStyleRule(
      'background-color',
      theme.colors.white
    );

    expect(await component.findAllByText('Chef', {})).toHaveLength(1);
    expect(component.queryByTestId('chef-not-found-icon')).toBeNull();
  });

  it('should render a warning state if the chef is not defined', async () => {
    const store = configureStore({
      feed: {},
      cards: {
        'test-chef-card': {
          id: 'test-chef-id',
          uuid: 'test-chef-card',
          meta: {
            chefTheme: {
              id: 'test-chef-theme-id',
              palette: {},
            },
          },
        },
      },
      chefs: {
        data: {},
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
      'This chef might not load in the app, please select an alternative.'
    );

    const metacontainer = await component.findAllByTestId('meta-container');
    expect(metacontainer).toHaveLength(1);
    expect(metacontainer[0]).toHaveStyleRule(
      'background-color',
      theme.colors.greyMediumLight
    );
    expect(component.queryByText('Chef')).toBeNull();
    expect(await component.findAllByTestId('chef-not-found-icon')).toHaveLength(
      1
    );
  });
});
