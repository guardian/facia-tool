import { validateId, generateId } from '../snap';

describe('utils/snap', () => {
  it('generates an id', () => {
      expect(generateId()).toMatch(/^snap\/\d+$/);
  });

  it('validate a snap', () => {
      expect(validateId('snap/1234')).toBe('snap/1234');
      expect(validateId('/snap/2345')).toBe('snap/2345');
      expect(validateId('http://theguardian.com/snap/3456')).toBe('snap/3456');
      expect(validateId('https://anotherurl.com/snap/4567')).toBe('snap/4567');
  });
});
