import React from 'react';
import { cleanup, render } from 'react-testing-library';
import ArticlePageNumberSection from '../ArticlePageNumberSection';
import { CapiArticle } from '../../../types/Capi';

const testCapiArticleWithPageNumber: CapiArticle = {
	id: 'test',
	type: 'test',
	sectionId: 'test',
	sectionName: 'test',
	webPublicationDate: 'test',
	urlPath: 'test/',
	webTitle: 'test',
	webUrl: 'test/test',
	elements: [],
	frontsMeta: {
		defaults: {
			imageCutoutReplace: false,
			imageHide: false,
			imageReplace: false,
			imageSlideshowReplace: false,
			isBoosted: false,
			isBreaking: false,
			showLargeHeadline: false,
			showByline: false,
			showKickerCustom: false,
			showKickerSection: false,
			showKickerTag: false,
			showLivePlayable: false,
			showMainVideo: false,
			showQuotedHeadline: false,
		},
	},
	fields: {
		headline: 'test',
		trailText: 'test',
		byline: 'test',
		firstPublicationDate: 'test',
		internalPageCode: 'test',
		liveBloggingNow: 'false',
		shortUrl: 'test/test',
		thumbnail: 'test',
		newspaperPageNumber: 5,
	},
	blocks: {},
	isHosted: false,
	pillarId: 'pillar/test',
	pillarName: 'test',
};

describe('ArticlePageNumberSection', () => {
	afterEach(cleanup);
	it('should render article page number section if article and articlePageNumber field exists', () => {
		const { getAllByText } = render(
			<ArticlePageNumberSection article={testCapiArticleWithPageNumber} />,
		);

		expect(getAllByText('Page 5').length).toBe(1);
	});
	it('should render empty article page number section if article or articlePageNumber field do not exists', () => {
		const testCapiArticleWithoutPageNumber = Object.assign(
			{},
			testCapiArticleWithPageNumber,
		);
		delete testCapiArticleWithoutPageNumber.fields.newspaperPageNumber;

		const { queryAllByText } = render(
			<ArticlePageNumberSection article={testCapiArticleWithoutPageNumber} />,
		);

		expect(queryAllByText('Page').length).toBe(0);
	});
});
