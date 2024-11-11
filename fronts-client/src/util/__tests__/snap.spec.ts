import {
	validateId,
	generateId,
	createLatestSnap,
	createSnap,
	createAtomSnap,
} from 'util/snap';
import tagPageHtml from 'fixtures/guardianTagPage';
import fetchMock from 'fetch-mock';
import bbcSectionPage from 'fixtures/bbcSectionPage';
import { capiAtom } from 'fixtures/capiAtom.js';
import {
	CAPIInteractiveAtomResponse,
	CAPIAtomInteractive,
} from 'services/capiQuery';

jest.mock('uuid/v4', () => () => 'uuid');

describe('utils/snap', () => {
	const localNow = Date.now;
	const localGetTime = Date.prototype.getTime;
	const mockNow = jest.fn(() => 1487076708000);
	beforeAll(() => {
		Date.prototype.getTime = mockNow;
		Date.now = mockNow;
	});
	afterAll(() => {
		Date.prototype.getTime = localGetTime;
		Date.now = localNow;
	});
	describe('generateId', () => {
		it('generates an id', () => {
			expect(generateId()).toMatch(/^snap\/\d+$/);
		});
	});

	describe('validateId', () => {
		it('converts a URL into a valid snaplink', () => {
			expect(validateId('snap/1234')).toBe('snap/1234');
			expect(validateId('/snap/2345')).toBe('snap/2345');
			expect(validateId('http://theguardian.com/snap/3456')).toBe('snap/3456');
			expect(validateId('https://anotherurl.com/snap/4567')).toBe('snap/4567');
		});
	});
	describe('convertToLatestSnap', () => {
		it("should create a snap of type 'latest'", () => {
			expect(createLatestSnap('example', 'custom kicker')).toEqual({
				frontPublicationDate: 1487076708000,
				id: 'snap/1487076708000',
				meta: {
					customKicker: 'custom kicker',
					href: 'example',
					showKickerCustom: true,
					snapType: 'latest',
					snapUri: 'example',
				},
				uuid: 'uuid',
			});
		});
	});
	describe('convertToLinkSnap', () => {
		it("should create a snap of type 'link' given an internal link", async () => {
			fetchMock.once(
				'/http/proxy/https://www.theguardian.com/world/eu?view=mobile',
				tagPageHtml,
			);
			const linkSnap = await createSnap('https://www.theguardian.com/world/eu');
			expect(linkSnap).toEqual({
				frontPublicationDate: 1487076708000,
				id: 'snap/1487076708000',
				meta: {
					href: '/world/eu',
					headline: 'European Union | World news | The Guardian',
					trailText: undefined,
					snapType: 'link',
					byline: undefined,
					showByline: false,
				},
				uuid: 'uuid',
			});
		});
		it("should create a snap of type 'link' given an external link", async () => {
			fetchMock.once('/http/proxy/https:/www.bbc.co.uk/news', bbcSectionPage);
			const linkSnap = await createSnap('https:/www.bbc.co.uk/news');
			expect(linkSnap).toEqual({
				frontPublicationDate: 1487076708000,
				id: 'snap/1487076708000',
				meta: {
					byline: 'BBC News',
					headline: 'Business - BBC News',
					href: 'https:/www.bbc.co.uk/news',
					showByline: true,
					snapType: 'link',
					trailText:
						'The latest BBC Business News: breaking personal finance, company, financial and economic news, plus insight and analysis into UK and global markets.',
				},
				uuid: 'uuid',
			});
		});
	});

	describe('convert to Atom snap', () => {
		it("should create a snap of 'interactive', given a link to an atom in the public content api", async () => {
			fetchMock.once('begin:/api/live', capiAtom);
			const interactive: CAPIAtomInteractive = {
				id: '',
				atomType: '',
				labels: [],
				defaultHtml: '',
				data: { interactive: { title: 'General Election 2017' } },
				contentChangeDetails: {},
				commissioningDesks: [],
			};
			const atom: CAPIInteractiveAtomResponse = {
				response: {
					status: 'ok',
					userTier: capiAtom.response.userTier,
					total: capiAtom.response.total,
					interactive,
				},
			};
			const atomLinkSnap = await createAtomSnap(
				'https://content.guardianapis.com/atom/interactive/interactives/2017/06/general-election',
				atom,
			);
			expect(atomLinkSnap).toEqual({
				uuid: 'uuid',
				frontPublicationDate: 1487076708000,
				id: 'snap/1487076708000',
				meta: {
					headline: 'General Election 2017',
					byline: 'Guardian Visuals',
					showByline: false,
					snapType: 'interactive',
					snapUri:
						'https://content.guardianapis.com/atom/interactive/interactives/2017/06/general-election',
					atomId: 'atom/interactive/interactives/2017/06/general-election',
					href: 'https://content.guardianapis.com/atom/interactive/interactives/2017/06/general-election',
				},
			});
		});
	});
});
