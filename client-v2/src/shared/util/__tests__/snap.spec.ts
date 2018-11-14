import {
  validateId,
  generateId,
  createLatestSnap,
  createLinkSnap
} from '../snap';
import tagPageHtml from '../../fixtures/guardianTagPage';
import fetchMock from 'fetch-mock';

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
    it("should convert an article fragment to a snap of type 'latest'", () => {
      expect(createLatestSnap('example', 'custom kicker')).toEqual({
        frontPublicationDate: 1487076708000,
        id: 'snap/1487076708000',
        meta: {
          byline: undefined,
          customKicker: 'custom kicker',
          headline: undefined,
          href: 'example',
          showKickerCustom: true,
          snapType: 'latest',
          snapUri: 'example',
          trailText: undefined
        },
        uuid: 'uuid'
      });
    });
  });
  describe('convertToLinkSnap', () => {
    it("should convert an article fragment to a snap of type 'link'", async () => {
      fetchMock.once(
        '/http/proxy/https://www.theguardian.com/world/eu?view=mobile',
        tagPageHtml
      );
      const linkSnap = await createLinkSnap(
        'https://www.theguardian.com/world/eu'
      );
      expect(linkSnap).toEqual({
        frontPublicationDate: 1487076708000,
        id: 'snap/1487076708000',
        meta: {
          href: '/world/eu',
          byline: 'the Guardian',
          headline: 'European Union | World news | The Guardian',
          showByline: true,
          snapType: 'link',
          trailText: undefined
        },
        uuid: 'uuid'
      });
    });
  });
});
