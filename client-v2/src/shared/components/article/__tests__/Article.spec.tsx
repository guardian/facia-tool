import React from 'react';
import { render, prettyDOM, cleanup } from 'react-testing-library';
import { ArticleComponent } from '../Article';
import 'jest-dom/extend-expect';
import derivedArticle from 'fixtures/derivedArticle';

const takenDownArticle = { ...derivedArticle, ...{ isLive: false } };

const draftArticle = {
  ...derivedArticle,
  ...{ isLive: false, firstPublicationDate: undefined }
};

describe('Article component ', () => {
  afterEach(cleanup);
  it('should render kicker correctly', () => {
    const { getByTestId, container } = render(
      <ArticleComponent
        children={<React.Fragment />}
        article={derivedArticle}
        id="ea1"
      />
    );
    expect(getByTestId('article-body')).toHaveTextContent(
      derivedArticle.kicker ? derivedArticle.kicker : ''
    );
    expect(getByTestId('article-body')).not.toHaveTextContent('Draft');
    expect(getByTestId('article-body')).not.toHaveTextContent('Taken Down');
  });
  it('should render draft labels correctly', () => {
    const { getByTestId } = render(
      <ArticleComponent
        children={<React.Fragment />}
        article={draftArticle}
        id="ea1"
      />
    );
    expect(getByTestId('article-body')).toHaveTextContent('Draft');
    expect(getByTestId('article-body')).not.toHaveTextContent('Taken Down');
  });

  it('should render taken down labels correctly', () => {
    const { getByTestId } = render(
      <ArticleComponent
        children={<React.Fragment />}
        article={takenDownArticle}
        id="ea1"
      />
    );
    expect(getByTestId('article-body')).toHaveTextContent('Taken Down');
    expect(getByTestId('article-body')).not.toHaveTextContent('Draft');
  });
});
