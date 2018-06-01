// @flow

import createMetadataBundle from '../createMetadataReducer';

const { actions, reducer, selectors, initialState } = createMetadataBundle(
  'books'
);

describe('getMetaDataReducer', () => {
  const { now } = Date;

  beforeAll(() => {
    (Date: any).now = jest.fn(() => 1337);
  });

  afterAll(() => {
    (Date: any).now = now;
  });

  describe('actions', () => {
    it('should provide actions for a given data type', () => {
      expect(actions.fetchStart()).toEqual({
        type: 'BOOKS_FETCH_START',
        payload: { id: undefined }
      });
      expect(actions.fetchStart('bookId')).toEqual({
        type: 'BOOKS_FETCH_START',
        payload: { id: 'bookId' }
      });
      expect(actions.fetchSuccess({ data: 'exampleData' })).toEqual({
        type: 'BOOKS_FETCH_SUCCESS',
        payload: { data: { data: 'exampleData' }, time: 1337 }
      });
      expect(actions.fetchError('Something went wrong')).toEqual({
        type: 'BOOKS_FETCH_ERROR',
        payload: { error: 'Something went wrong', time: 1337 }
      });
    });
  });

  describe('selectors', () => {
    it('should provide a selector to get the loading state', () => {
      expect(selectors.selectIsLoading({ books: initialState })).toBe(false);
      expect(
        selectors.selectIsLoading({
          books: { ...initialState, loadingIds: ['@@ALL'] }
        })
      ).toBe(true);
    });
    it('should provide a selector to get the loading state for specific IDs', () => {
      const bundle = createMetadataBundle('books', {
        indexById: true
      });
      const state = {
        books: { ...bundle.initialState, loadingIds: ['1', '2'] }
      };
      expect(bundle.selectors.selectIsLoadingById(state, '1')).toBe(true);
      expect(bundle.selectors.selectIsLoadingById(state, '2')).toBe(true);
      expect(bundle.selectors.selectIsLoadingById(state, '3')).toBe(false);
    });
    it('should provide selectors that operate on non-standard mount points', () => {
      const bundle = createMetadataBundle('books', {
        mountPoint: 'otherBooks'
      });
      expect(
        bundle.selectors.selectIsLoading({
          otherBooks: { ...bundle.initialState, loadingIds: ['@@ALL'] }
        })
      ).toBe(true);
    });
    it('should provide a selector to get the current error', () => {
      expect(selectors.selectCurrentError({ books: initialState })).toBe(null);
      expect(
        selectors.selectCurrentError({
          books: { ...initialState, error: 'Something went wrong' }
        })
      ).toBe('Something went wrong');
    });
    it('should provide a selector to get the last error', () => {
      expect(selectors.selectLastError({ books: initialState })).toBe(null);
      expect(
        selectors.selectLastError({
          books: { ...initialState, lastError: 'Something went wrong' }
        })
      ).toBe('Something went wrong');
    });
    it('should provide a selector to get the last fetch time', () => {
      expect(selectors.selectLastFetch({ books: initialState })).toBe(null);
      expect(
        selectors.selectLastFetch({
          books: { ...initialState, lastFetch: 1337 }
        })
      ).toBe(1337);
    });
  });

  describe('reducer', () => {
    it('should mark the state as loading when a start action is dispatched', () => {
      const newState = reducer(initialState, actions.fetchStart());
      expect(newState.loadingIds).toEqual(['@@ALL']);
    });
    it('should merge data and mark the state as not loading when a success action is dispatched', () => {
      const newState = reducer(
        { ...initialState, loading: true },
        actions.fetchSuccess({ uuid: { id: 'uuid', author: 'Mark Twain' } })
      );
      expect(newState.loadingIds).toEqual([]);
      expect(newState.data).toEqual({
        uuid: { id: 'uuid', author: 'Mark Twain' }
      });
    });
    it('should merge data by id if indexById is true', () => {
      const bundle = createMetadataBundle('books', { indexById: true });
      const newState = bundle.reducer(
        { ...initialState, loadingIds: ['uuid'] },
        actions.fetchSuccess({ id: 'uuid', author: 'Mark Twain' })
      );
      expect(newState.loadingIds).toEqual([]);
      expect(newState.data).toEqual({
        uuid: { id: 'uuid', author: 'Mark Twain' }
      });
    });
    it('should add an error and mark the state as not loading when an error action is dispatched', () => {
      const newState = reducer(
        { ...initialState, data: {}, loadingIds: ['uuid'] },
        actions.fetchError('uuid')
      );
      expect(newState.loadingIds).toEqual([]);
      expect(newState.data).toEqual({});
    });
  });
});
