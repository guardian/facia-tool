// @flow

import { without, snakeCase } from 'lodash';

const createSelectCurrentError = selectLocalState => (state: any) =>
  selectLocalState(state).error;

const createSelectLastError = selectLocalState => (state: any) =>
  selectLocalState(state).lastError;

const createSelectLastFetch = selectLocalState => (state: any) =>
  selectLocalState(state).lastFetch;

const createSelectIsLoading = selectLocalState => (state: any) =>
  !!selectLocalState(state).loadingIds.length;

const createSelectIsLoadingById = selectLocalState => (
  state: any,
  id: string
) => selectLocalState(state).loadingIds.indexOf(id) !== -1;

const createSelectById = selectLocalState => (state: any, id: string) =>
  selectLocalState(state).data[id];

const createSelectAll = selectLocalState => (state: any) =>
  selectLocalState(state).data;

const createSelectors = (
  selectLocalState: (state: any) => any,
  indexById: boolean
) => {
  if (indexById) {
    return {
      selectCurrentError: createSelectCurrentError(selectLocalState),
      selectLastError: createSelectLastError(selectLocalState),
      selectLastFetch: createSelectLastFetch(selectLocalState),
      selectIsLoading: createSelectIsLoading(selectLocalState),
      selectIsLoadingById: createSelectIsLoadingById(selectLocalState),
      selectById: createSelectById(selectLocalState),
      selectAll: createSelectAll(selectLocalState)
    };
  }
  return {
    selectCurrentError: createSelectCurrentError(selectLocalState),
    selectLastError: createSelectLastError(selectLocalState),
    selectLastFetch: createSelectLastFetch(selectLocalState),
    selectIsLoading: createSelectIsLoading(selectLocalState),
    selectIsLoadingById: createSelectIsLoadingById(selectLocalState),
    selectAll: createSelectAll(selectLocalState)
  };
};

type TOptions = {
  // The key the reducer provided by this bundle is mounted at.
  // Defaults to entityName if none is given.
  mountPoint?: string,
  // Do we index the incoming data by id,
  indexById?: boolean,
  // Provides a namespace for the created actions, separated by a slash,
  // e.g.the resource 'books' namespaced with 'shared' becomes SHARED/BOOKS
  namespace?: string
};

/**
 * Creates a bundle of actions, selectors, and a reducer to handle
 * common actions and selections for data that needs to be fetched:
 * start, success and error actions, storing and selecting error states,
 * and storing and selecting staleness data, as well as storing the
 * fetched data itself.
 *
 * Consumers can add add their own actions and selectors, and extend
 * the given reducer, to provide additional functionality.
 *
 * @todo Add a DataType parameter, passed explicitly to the factory
 * function, to type data passed in on success, which is currently 'any'.
 *
 * @param {string} entityName  The name of the entity for which this reducer is responsible
 * @param {TOptions} options
 */
export default (
  entityName: string,
  options: TOptions = { indexById: false }
) => {
  const { indexById, mountPoint } = options;
  const baseActionKey = snakeCase(entityName).toUpperCase();
  const actionKey = options.namespace
    ? `${options.namespace.toUpperCase()}/${baseActionKey}`
    : baseActionKey;
  const FETCH_START = `${actionKey}_FETCH_START`;
  const FETCH_SUCCESS = `${actionKey}_FETCH_SUCCESS`;
  const FETCH_ERROR = `${actionKey}_FETCH_ERROR`;

  type State = {
    data?: any | null,
    lastError: string | null,
    error: string | null,
    lastFetch: number | null,
    loadingIds: string[]
  };

  const initialState: State = {
    data: {},
    lastError: null,
    error: null,
    lastFetch: null,
    loading: false,
    loadingIds: []
  };

  const applyNewData = (state: State, newData: any) => {
    if (!indexById) {
      return {
        ...state.data,
        ...newData
      };
    }

    if (Array.isArray(newData)) {
      return {
        ...state.data,
        ...newData.reduce(
          (acc, model) => ({
            ...acc,
            [model.id]: model
          }),
          {}
        )
      };
    }
    return {
      ...state.data,
      [(newData: any).id]: newData
    };
  };

  const selectLocalState = (state: any): State =>
    state[mountPoint || entityName];

  type TFetchStartAction = {|
    // In this, and subsequent action types, we include a local
    // type to ensure that Flow can disambiguate action types in the
    // reducer. Alternative solutions welcome!
    localType: 'START',
    type: typeof FETCH_START,
    payload: { ids?: string[] }
  |};

  const fetchStartAction = (ids?: string[]): TFetchStartAction => ({
    localType: 'START',
    type: FETCH_START,
    payload: { ids }
  });

  type TFetchSuccessAction = {|
    localType: 'SUCCESS',
    type: typeof FETCH_SUCCESS,
    payload: { data: any, time: number }
  |};

  const fetchSuccessAction = (data: any): TFetchSuccessAction => ({
    localType: 'SUCCESS',
    type: FETCH_SUCCESS,
    payload: { data, time: Date.now() }
  });

  type TFetchErrorAction = {|
    localType: 'ERROR',
    type: typeof FETCH_ERROR,
    payload: {
      error: string,
      time: number,
      id?: string
    }
  |};

  const fetchErrorAction = (error: string, id?: string): TFetchErrorAction => ({
    localType: 'ERROR',
    type: FETCH_ERROR,
    payload: { error, id, time: Date.now() }
  });

  type TAction = TFetchStartAction | TFetchSuccessAction | TFetchErrorAction;

  return {
    initialState,
    reducer: (state: State = initialState, action: TAction): State => {
      if (action.type === FETCH_START && action.localType === 'START') {
        return {
          ...state,
          loadingIds: state.loadingIds.concat(action.payload.ids || '@@ALL')
        };
      }
      if (action.type === FETCH_SUCCESS && action.localType === 'SUCCESS') {
        return {
          ...state,
          data: applyNewData(state, action.payload.data),
          lastFetch: action.payload.time,
          error: null,
          lastError: null,
          loadingIds: indexById
            ? without(state.loadingIds, action.payload.data.id)
            : []
        };
      }
      if (action.type === FETCH_ERROR && action.localType === 'ERROR') {
        if (!action.payload || !action.payload.error || !action.payload.time) {
          return state;
        }
        if (!action.payload.error) {
          return state;
        }
        return {
          ...state,
          lastError: action.payload.error,
          error: action.payload.error,
          loadingIds: indexById
            ? without(state.loadingIds, action.payload.id)
            : []
        };
      }
      return state;
    },
    actionNames: {
      fetchStart: FETCH_START,
      fetchSuccess: FETCH_SUCCESS,
      fetchError: FETCH_ERROR
    },
    actions: {
      fetchStart: fetchStartAction,
      fetchSuccess: fetchSuccessAction,
      fetchError: fetchErrorAction
    },
    selectors: createSelectors(selectLocalState, !!indexById)
  };
};
