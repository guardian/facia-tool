import React from 'react';
import { render, cleanup } from 'react-testing-library';
import { ArticleComponent } from '../Article';
import 'jest-dom/extend-expect';
import derivedArticle from 'fixtures/derivedArticle';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../../../constants/theme';
import { Provider } from 'react-redux';
import configureStore from 'util/configureStore';

const takenDownArticle = { ...derivedArticle, ...{ isLive: false } };

const draftArticle = {
  ...derivedArticle,
  ...{ isLive: false, firstPublicationDate: undefined }
};

const store = configureStore();

describe('Article component ', () => {
  afterEach(cleanup);
  it('should render kicker correctly', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ArticleComponent
            children={<React.Fragment />}
            article={derivedArticle}
            id="ea1"
          />
        </ThemeProvider>
      </Provider>
    );
    expect(getByTestId('article-body')).toHaveTextContent(
      derivedArticle.kicker ? derivedArticle.kicker : ''
    );
    expect(getByTestId('article-body')).not.toHaveTextContent('Draft');
    expect(getByTestId('article-body')).not.toHaveTextContent('Taken Down');
  });
  it('should render draft labels correctly', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ArticleComponent
            children={<React.Fragment />}
            article={draftArticle}
            id="ea1"
          />
        </ThemeProvider>
      </Provider>
    );
    expect(getByTestId('article-body')).toHaveTextContent('Draft');
    expect(getByTestId('article-body')).not.toHaveTextContent('Taken Down');
  });

  it('should render taken down labels correctly', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ArticleComponent
            children={<React.Fragment />}
            article={takenDownArticle}
            id="ea1"
          />
        </ThemeProvider>
      </Provider>
    );
    expect(getByTestId('article-body')).toHaveTextContent('Taken Down');
    expect(getByTestId('article-body')).not.toHaveTextContent('Draft');
  });

  it('should render loading placeholders when the isLoading prop is true and there is not article', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ArticleComponent
            children={<React.Fragment />}
            article={undefined}
            id="ea1"
            isLoading={true}
          />
        </ThemeProvider>
      </Provider>
    );
    expect(getByTestId('loading-placeholder')).toBeTruthy();
  });

  it('should not render loading placeholders when the isLoading prop is true but the article is present', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ArticleComponent
            children={<React.Fragment />}
            article={takenDownArticle}
            id="ea1"
            isLoading={true}
          />
        </ThemeProvider>
      </Provider>
    );
    expect(getByTestId('loading-placeholder')).toBeTruthy();
  });

  it('should not render loading placeholders when the isLoading prop is false or not present', () => {
    let renderResult = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ArticleComponent
            children={<React.Fragment />}
            article={takenDownArticle}
            id="ea1"
            isLoading={false}
          />
        </ThemeProvider>
      </Provider>
    );
    expect(
      renderResult.getByTestId.bind(renderResult, 'loading-placeholder')
    ).toThrow();
    renderResult = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ArticleComponent
            children={<React.Fragment />}
            article={takenDownArticle}
            id="ea1"
          />
        </ThemeProvider>
      </Provider>
    );
    expect(
      renderResult.getByTestId.bind(renderResult, 'loading-placeholder')
    ).toThrow();
  });
});
