// @flow

import createMetadataBundle from '../createAsyncResourceBundle';

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
  describe('actionNames', () => {
    it('should provide action names for a given resource name, in upper snake case', () => {
      const { actionNames } = createMetadataBundle('ExternalArticles');
      expect(actionNames).toEqual({
        fetchStart: 'EXTERNAL_ARTICLES_FETCH_START',
        fetchSuccess: 'EXTERNAL_ARTICLES_FETCH_SUCCESS',
        fetchError: 'EXTERNAL_ARTICLES_FETCH_ERROR'
      });
    });
    it('should namespace the action names with the provided option', () => {
      const { actionNames } = createMetadataBundle('ExternalArticles', {
        namespace: 'shared'
      });
      expect(actionNames).toEqual({
        fetchStart: 'SHARED/EXTERNAL_ARTICLES_FETCH_START',
        fetchSuccess: 'SHARED/EXTERNAL_ARTICLES_FETCH_SUCCESS',
        fetchError: 'SHARED/EXTERNAL_ARTICLES_FETCH_ERROR'
      });
    });
  });

  describe('actions', () => {
    it('should provide actions for a given data type', () => {
      expect(actions.fetchStart()).toEqual({
        localType: 'START',
        type: 'BOOKS_FETCH_START',
        payload: { ids: undefined }
      });
      expect(actions.fetchStart(['bookId'])).toEqual({
        localType: 'START',
        type: 'BOOKS_FETCH_START',
        payload: { ids: ['bookId'] }
      });
      expect(actions.fetchSuccess({ data: 'exampleData' })).toEqual({
        localType: 'SUCCESS',
        type: 'BOOKS_FETCH_SUCCESS',
        payload: { data: { data: 'exampleData' }, time: 1337 }
      });
      expect(actions.fetchError('Something went wrong')).toEqual({
        localType: 'ERROR',
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
    it('should provide a selector to get all of the stored data', () => {
      expect(selectors.selectAll({ books: initialState })).toEqual(
        initialState.data
      );
    });
    it('should provide a selector to select data by id, if indexById is true', () => {
      const bundle = createMetadataBundle('books', {
        indexById: true
      });
      const state = {
        books: {
          data: {
            1: { id: 1 },
            2: { id: 2 }
          }
        }
      };
      expect(bundle.selectors.selectById(state, 1)).toEqual({
        id: 1
      });
      expect(bundle.selectors.selectById(state, 2)).toEqual({
        id: 2
      });
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
        bundle.actions.fetchSuccess({ id: 'uuid', author: 'Mark Twain' })
      );
      expect(newState.loadingIds).toEqual([]);
      expect(newState.data).toEqual({
        uuid: { id: 'uuid', author: 'Mark Twain' }
      });
    });
    it('should merge arrays, too', () => {
      const bundle = createMetadataBundle('books', { indexById: true });
      const newState = bundle.reducer(
        { ...initialState, loading: true },
        bundle.actions.fetchSuccess([
          { id: 'uuid', author: 'Mark Twain' },
          { id: 'uuid2', author: 'Elizabeth Gaskell' }
        ])
      );
      expect(newState.loadingIds).toEqual([]);
      expect(newState.data).toEqual({
        uuid: { id: 'uuid', author: 'Mark Twain' },
        uuid2: { id: 'uuid2', author: 'Elizabeth Gaskell' }
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
