import React from 'react';
import { render, cleanup } from 'react-testing-library';
import { ArticleComponent } from '../Article';
import 'jest-dom/extend-expect';
import derivedArticle from 'fixtures/derivedArticle';
import { ThemeProvider } from 'styled-components';
import { theme } from 'shared/constants/theme';

const takenDownArticle = { ...derivedArticle, ...{ isLive: false } };

const draftArticle = {
  ...derivedArticle,
  ...{ isLive: false, firstPublicationDate: undefined }
};

describe('Article component ', () => {
  afterEach(cleanup);
  it('should render kicker correctly', () => {
    const { getByTestId } = render(
<<<<<<< HEAD
      <ThemeProvider theme={theme}>
        <ArticleComponent
          children={<React.Fragment />}
          article={derivedArticle}
          id="ea1"
        />
      </ThemeProvider>
=======
      <ArticleComponent
        children={<React.Fragment />}
        article={derivedArticle}
        id="ea1"
      />
>>>>>>> Bang, and the unused stuff is gone
    );
    expect(getByTestId('article-body')).toHaveTextContent(
      derivedArticle.kicker ? derivedArticle.kicker : ''
    );
    expect(getByTestId('article-body')).not.toHaveTextContent('Draft');
    expect(getByTestId('article-body')).not.toHaveTextContent('Taken Down');
  });
  it('should render draft labels correctly', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <ArticleComponent
          children={<React.Fragment />}
          article={draftArticle}
          id="ea1"
        />
      </ThemeProvider>
    );
    expect(getByTestId('article-body')).toHaveTextContent('Draft');
    expect(getByTestId('article-body')).not.toHaveTextContent('Taken Down');
  });

  it('should render taken down labels correctly', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <ArticleComponent
          children={<React.Fragment />}
          article={takenDownArticle}
          id="ea1"
        />
      </ThemeProvider>
    );
    expect(getByTestId('article-body')).toHaveTextContent('Taken Down');
    expect(getByTestId('article-body')).not.toHaveTextContent('Draft');
  });
});
