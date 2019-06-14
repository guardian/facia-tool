import { getFullPath, getV2SubPath } from 'selectors/pathSelectors';

describe('pathSelectors', () => {
  describe('getFullPath', () => {
    it('gets the full path from state', () => {
      expect(getFullPath({ path: '/v2/test/path' } as any)).toBe(
        '/v2/test/path'
      );
    });
  });
  describe('getV2SubPath', () => {
    it('gets the path below /v2', () => {
      expect(getV2SubPath({ path: '/v2/test/path' } as any)).toBe('/test/path');
    });

    it('returns the full path if not in a /v2 root path', () => {
      expect(getV2SubPath({ path: '/v1/v2/test/path' } as any)).toBe(
        '/v1/v2/test/path'
      );
    });
  });
});
