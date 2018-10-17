import createAsyncResourceBundle from '../createAsyncResourceBundle';

const { actions, reducer, selectors, initialState } = createAsyncResourceBundle(
  'books'
);

describe('createAsyncResourceBundle', () => {
  const { now } = Date;

  beforeAll(() => {
    (Date as any).now = jest.fn(() => 1337);
  });

  afterAll(() => {
    (Date as any).now = now;
  });
  describe('actionNames', () => {
    it('should provide action names for a given resource name, in upper snake case', () => {
      const { actionNames } = createAsyncResourceBundle('ExternalArticles');
      expect(actionNames).toEqual({
        fetchStart: 'FETCH_START',
        fetchSuccess: 'FETCH_SUCCESS',
        fetchError: 'FETCH_ERROR',
        updateStart: 'UPDATE_START',
        updateSuccess: 'UPDATE_SUCCESS',
        updateError: 'UPDATE_ERROR'
      });
    });
  });

  describe('actions', () => {
    it('should provide actions for a given data type', () => {
      expect(actions.fetchStart()).toEqual({
        entity: 'books',
        type: 'FETCH_START',
        payload: { ids: undefined }
      });
      expect(actions.fetchStart(['bookId'])).toEqual({
        entity: 'books',
        type: 'FETCH_START',
        payload: { ids: ['bookId'] }
      });
      expect(actions.fetchSuccess({ data: 'exampleData' })).toEqual({
        entity: 'books',
        type: 'FETCH_SUCCESS',
        payload: { data: { data: 'exampleData' }, time: 1337 }
      });
      expect(actions.fetchError('Something went wrong')).toEqual({
        entity: 'books',
        type: 'FETCH_ERROR',
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
      const bundle = createAsyncResourceBundle('books', {
        indexById: true
      });
      const state = {
        books: { ...bundle.initialState, loadingIds: ['1', '2'] }
      };
      expect(bundle.selectors.selectIsLoadingById(state, '1')).toBe(true);
      expect(bundle.selectors.selectIsLoadingById(state, '2')).toBe(true);
      expect(bundle.selectors.selectIsLoadingById(state, '3')).toBe(false);
    });
    it('should accept a state selector to allow selectors to work on non-standard mount points', () => {
      const bundle = createAsyncResourceBundle('books', {
        selectLocalState: (state: any) => state.otherBooks
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
      const bundle = createAsyncResourceBundle('books', {
        indexById: true
      });
      const state = {
        books: {
          data: {
            '1': { id: '1' },
            '2': { id: '2' }
          }
        }
      };
      expect(bundle.selectors.selectById(state, '1')).toEqual({
        id: '1'
      });
      expect(bundle.selectors.selectById(state, '2')).toEqual({
        id: '2'
      });
    });
  });

  describe('Reducer', () => {
    describe('Fetch action handlers', () => {
      describe('Start action handler', () => {
        it('should mark the state as loading when a start action is dispatched', () => {
          const newState = reducer(initialState, actions.fetchStart());
          expect(newState.loadingIds).toEqual(['@@ALL']);
        });
        it('should add loading keys by uuid as strings', () => {
          const bundle = createAsyncResourceBundle('books', {
            indexById: true
          });
          const newState = bundle.reducer(
            initialState,
            actions.fetchStart('uuid')
          );
          expect(newState.loadingIds).toEqual(['uuid']);
        });
        it('should add loading keys by uuid as arrays', () => {
          const bundle = createAsyncResourceBundle('books', {
            indexById: true
          });
          const newState = bundle.reducer(
            initialState,
            actions.fetchStart(['uuid', 'uuid2'])
          );
          expect(newState.loadingIds).toEqual(['uuid', 'uuid2']);
        });
      });
      describe('Success action handler', () => {
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
          const bundle = createAsyncResourceBundle('books', {
            indexById: true
          });
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
          const bundle = createAsyncResourceBundle('books', {
            indexById: true
          });
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
      });
      describe('Error action handler', () => {
        it('should add an error and mark the state as not loading when an error action is dispatched', () => {
          const newState = reducer(
            { ...initialState, data: {}, loadingIds: ['uuid'] },
            actions.fetchError('uuid')
          );
          expect(newState.loadingIds).toEqual([]);
          expect(newState.data).toEqual({});
        });
        it('should handle strings and arrays of strings for loading uuids', () => {
          const newState = reducer(
            { ...initialState, data: {}, loadingIds: ['uuid', 'uuid2'] },
            actions.fetchError('Error', ['uuid', 'uuid2'])
          );
          expect(newState.loadingIds).toEqual([]);
          expect(newState.data).toEqual({});
        });
      });
    });
    describe('Update action handlers', () => {
      describe('Update start', () => {
        it('should mark the state as updating when a start action is dispatched', () => {
          const newState = reducer(initialState, actions.updateStart({}));
          expect(newState.updatingIds).toEqual(['@@ALL']);
        });
        it('should add updating keys by uuid as strings', () => {
          const bundle = createAsyncResourceBundle('books', {
            indexById: true
          });
          const newState = bundle.reducer(
            initialState,
            actions.updateStart({
              id: 'uuid'
            })
          );
          expect(newState.updatingIds).toEqual(['uuid']);
        });
        it('should add the incoming updated model to the state', () => {
          const bundle = createAsyncResourceBundle('books', {
            indexById: true
          });
          const newState = bundle.reducer(
            initialState,
            actions.updateStart({ id: 'uuid' })
          );
          expect(newState.data.uuid).toEqual({ id: 'uuid' });
        });
      });
      describe('Update success', () => {
        it('should remove the updating id from the state', () => {
          const bundle = createAsyncResourceBundle('books', {
            indexById: true
          });
          const state = bundle.reducer(
            initialState,
            actions.updateStart({ id: 'uuid' })
          );
          const newState = bundle.reducer(
            state,
            actions.updateSuccess('uuid', { id: 'uuid' })
          );
          expect(newState.data.uuid).toEqual({ id: 'uuid' });
          expect(newState.updatingIds).toEqual([]);
        });
        it('should replace the model data if data is supplied', () => {
          const bundle = createAsyncResourceBundle('books', {
            indexById: true
          });
          const state = bundle.reducer(
            initialState,
            actions.updateStart({ id: 'uuid' })
          );
          const newState = bundle.reducer(
            state,
            actions.updateSuccess('uuid', {
              id: 'uuid',
              lastModified: 123456789
            })
          );
          expect(newState.data.uuid).toEqual({
            id: 'uuid',
            lastModified: 123456789
          });
          expect(newState.updatingIds).toEqual([]);
        });
        it('should remove the error message if it exists', () => {
          const bundle = createAsyncResourceBundle('books', {
            indexById: true
          });
          const newState = bundle.reducer(
            {
              ...initialState,
              error: 'There was a problem',
              lastError: 'There was a problem'
            },
            actions.updateSuccess('uuid', {
              id: 'uuid',
              lastModified: 123456789
            })
          );
          expect(newState.error).toEqual(null);
          expect(newState.lastError).toEqual('There was a problem');
        });
      });
      describe('Update error', () => {
        it('should remove the updating id from the state, and add an error message', () => {
          const bundle = createAsyncResourceBundle('books', {
            indexById: true
          });
          const state = bundle.reducer(
            initialState,
            actions.updateStart({ id: 'uuid' })
          );
          const newState = bundle.reducer(
            state,
            actions.updateError('There was a problem', 'uuid')
          );
          expect(newState.data.uuid).toEqual({ id: 'uuid' });
          expect(newState.updatingIds).toEqual([]);
          expect(newState.error).toEqual('There was a problem');
          expect(newState.lastError).toEqual('There was a problem');
        });
      });
    });
  });
});
