import fetchMock from 'fetch-mock';
import { fetchPageViewData } from '../PageViewData';
import { PageViewDataFromOphan } from 'types/PageViewData';
import {
	longOphanQuery,
	addendumToLongOphanQuery,
	shortOphanQuery,
} from '../../fixtures/pageViewData';

describe('fetchPageViewData', () => {
	it('should make a request to ophan to get ophan data', async () => {
		const frontIds = 'au/business';
		const articleIds: string[] = [
			'film/2015/aug/13/dads-army-film-first-trailer-bill-nighy-toby-jones-catherine-zeta-jones',
			'commentisfree/2015/aug/13/intern-tent-david-hyde-un-internship-geneva',
			'uk-news/2018/mar/14/sharp-rise-in-number-of-eu-nationals-applying-for-uk-citizenship',
		];

		fetchMock.once(`/ophan/histogram${shortOphanQuery}`, []);

		const result = await fetchPageViewData(frontIds, articleIds);
		expect(result).toEqual([]);
	});
	it('should make multiple requests to ophan when given a number of articles that would exceed ophans request length', async () => {
		const frontIds = 'uk';
		const articleIds = [
			'uk-news/2019/sep/19/fastest-growing-uk-terrorist-threat-is-from-far-right-say-police',
			'media/video/2019/sep/19/john-humphrys-signs-off-today-programme-32-years-video',
			'business/live/2019/sep/18/markets-uk-inflation-house-prices-brexit-fed-rate-decision-business-live',
			'food/2019/sep/18/cant-i-just-say-its-tasty-why-food-critics-go-too-far',
			'sport/live/2019/sep/18/county-cricket-hampshire-v-somerset-essex-v-surrey-and-more-live',
			'business/live/2019/sep/18/markets-uk-inflation-house-prices-brexit-fed-rate-decision-business-live',
			'film/2019/sep/18/draft-piece-005',
			'sport/2019/sep/16/scotland-strive-to-avoid-rugby-world-cup-slip-ups-with-shampoo-soaked-balls',
			'us-news/live/2019/sep/18/trump-greta-thunberg-news-today-live-latest-climate-change-testimony-updates',
			'world/2019/sep/18/israel-election-lengthy-coalition-talks-loom-exit-polls-early-results-deadlock',
			'us-news/live/2019/sep/18/trump-greta-thunberg-news-today-live-latest-climate-change-testimony-updates',
			'business/live/2019/sep/16/oil-price-saudi-arabia-iran-drone-markets-ftse-pound-brexit-business-live',
			'commentisfree/2019/sep/04/boris-johnson-electoral-gamble-wreck-tory-party',
			'politics/live/2019/sep/10/anger-abounds-after-parliament-suspended-in-night-of-high-drama-politics-live',
			'politics/live/2019/aug/30/politics-brexit-mps-lawyers-and-campaigners-battle-prorogation-live-news',
			'politics/live/2019/aug/30/politics-brexit-mps-lawyers-and-campaigners-battle-prorogation-live-news',
			'world/2021/apr/01/the-week-that-was',
			'commentisfree/2019/sep/04/food-banks-and-an-early-grave-austerity-britain',
			'football/live/2019/aug/30/lucy-bronze-wins-uefa-award-premier-league-previews-and-europa-league-draw-live',
			'world/2019/aug/23/emmanuel-macron-handle-donald-trump-g7-test',
			'business/2019/aug/28/thomas-cook-agrees-terms-of-900m-rescue-deal-with-fosun',
			'business/live/2019/aug/28/recession-fears-us-yield-curve-inverts-brexit-stock-market-bonds-looms-business-live',
			'commentisfree/2019/aug/22/why-planned-parenthood-was-right-to-refuse-federal-funding',
			'business/live/2019/aug/20/investors-stimulus-recession-fears-markets-ftse-trump-uk-factories-business-live',
		];

		const dataFromOphan1: PageViewDataFromOphan = {
			totalHits: 100,
			series: [],
			path: '',
		};

		const dataFromOphan2: PageViewDataFromOphan = {
			totalHits: 200,
			series: [],
			path: '',
		};

		const interval = 'hours=1&interval=10';

		fetchMock.once(`/ophan/histogram${longOphanQuery}${interval}`, [
			dataFromOphan1,
		]);
		fetchMock.once(`/ophan/histogram${addendumToLongOphanQuery}${interval}`, [
			dataFromOphan2,
		]);

		const result = await fetchPageViewData(frontIds, articleIds);
		expect(result).toEqual([dataFromOphan1, dataFromOphan2]);
	});
});
