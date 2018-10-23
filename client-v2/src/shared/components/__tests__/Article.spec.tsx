import React from 'react';
import { render, prettyDOM, cleanup } from "react-testing-library";
import { ArticleComponent } from "../Article";
import "jest-dom/extend-expect";

const article = { id: 'ea1',
  pillarName: 'external-pillar',
  frontPublicationDate: 1,
  publishedBy: 'A. N. Author',
  uuid: 'af1',
  headline: 'external-headline',
  thumbnail: undefined,
  tone: 'external-tone',
  trailText: 'external-trailText',
  kicker: 'external-pillar',
  byline: 'external-byline',
  isLive: true,
  firstPublicationDate: '2018-10-19T10:30:39Z',
  webTitle: 'title',
  webUrl: 'webUrl',
  urlPath: 'path',
  elements: [],
  pillarId: 'pillar/News',
  sectionId: 'education',
  sectionName: 'education',
  blocks: {}
};

const takenDownArticle = { id: 'ea1',
  pillarName: 'external-pillar',
  frontPublicationDate: 1,
  publishedBy: 'A. N. Author',
  uuid: 'af1',
  headline: 'external-headline',
  thumbnail: undefined,
  tone: 'external-tone',
  trailText: 'external-trailText',
  kicker: 'external-pillar',
  byline: 'external-byline',
  isLive: false,
  firstPublicationDate: '2018-10-19T10:30:39Z',
  webTitle: 'title',
  webUrl: 'webUrl',
  urlPath: 'path',
  elements: [],
  pillarId: 'pillar/News',
  sectionId: 'education',
  sectionName: 'education',
  blocks: {}
};

const draftArticle = { id: 'ea1',
  pillarName: 'external-pillar',
  frontPublicationDate: 1,
  publishedBy: 'A. N. Author',
  uuid: 'af1',
  headline: 'external-headline',
  thumbnail: undefined,
  tone: 'external-tone',
  trailText: 'external-trailText',
  kicker: 'external-pillar',
  byline: 'external-byline',
  isLive: false,
  webTitle: 'title',
  webUrl: 'webUrl',
  urlPath: 'path',
  elements: [],
  pillarId: 'pillar/News',
  sectionId: 'education',
  sectionName: 'education',
  blocks: {}
};

describe('Article component ', () => {

  afterEach(cleanup);
  it('should render correctly', () => {
      const { getByTestId, container } = render(
        <ArticleComponent
          children={<React.Fragment></React.Fragment>}
          article={article}
          id='ea1'
        />
      );
      expect(getByTestId("article-body")).toHaveTextContent(article.headline)
      expect(getByTestId("article-body")).not.toHaveTextContent('Draft')
      expect(getByTestId("article-body")).not.toHaveTextContent('Taken Down')
  });
  it('should render draft labels correctly', () => {
      const { getByTestId } = render(
        <ArticleComponent
          children={<React.Fragment></React.Fragment>}
          article={draftArticle}
          id='ea1'
        />
      );
      expect(getByTestId("article-body")).toHaveTextContent('Draft')
      expect(getByTestId("article-body")).not.toHaveTextContent('Taken Down')
  });

  it('should render taken down labels correctly', () => {
      const { getByTestId } = render(
        <ArticleComponent
          children={<React.Fragment></React.Fragment>}
          article={takenDownArticle}
          id='ea1'
        />
      );
      expect(getByTestId("article-body")).toHaveTextContent('Taken Down')
      expect(getByTestId("article-body")).not.toHaveTextContent('Draft')
  });

});
