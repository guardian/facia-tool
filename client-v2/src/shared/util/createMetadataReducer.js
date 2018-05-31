// @flow

import type { $ReturnType } from '../types/Utility';

const createSelectCurrentError = selectLocalState => (state: any) =>
  selectLocalState(state).error;

const createSelectLastError = selectLocalState => (state: any) =>
  selectLocalState(state).lastError;

const createSelectLastFetch = selectLocalState => (state: any) =>
  selectLocalState(state).lastFetch;

const createSelectIsLoading = selectLocalState => (state: any) =>
  selectLocalState(state).loading;

/**
 * Creates a bundle of actions, selectors, and a reducer to handle
 * common actions and selections for data that needs to be fetched:
 * start, success and error actions, storing and selecting error states,
 * and storing and selecting staleness data, as well as storing the
 * fetched data itself.
 *
 * Consumers can add add their own actions and selectors, and extend
 * the given reducer, to provide additional functionality.
 */
export default <T>({
  entityName,
  mountPoint
}: {
  // The name of the entity for which this bundle is responsible.
  entityName: string,
  // The key the reducer provided by this bundle is mounted at.
  // Defaults to entityName if none is given.
  mountPoint?: string
}) => {
  const actionKey = entityName.toUpperCase();
  const FETCH_START = `FETCH_${actionKey}_START`;
  const FETCH_SUCCESS = `FETCH_${actionKey}_SUCCESS`;
  const FETCH_ERROR = `FETCH_${actionKey}_ERROR`;

  type State = {
    data?: T | null,
    lastError: string | null,
    error: string | null,
    lastFetch: string | null,
    loading: boolean
  };

  const initialState: State = {
    data: null,
    lastError: null,
    error: null,
    lastFetch: null,
    loading: false
  };

  const selectLocalState = (state: any): State =>
    state[mountPoint || entityName];
  const fetchStartAction = (): { type: typeof FETCH_START } => ({
    type: FETCH_START
  });
  const fetchSuccessAction = (
    data: T
  ): {
    type: typeof FETCH_SUCCESS,
    payload: { data: T, time: number }
  } => ({
    type: FETCH_SUCCESS,
    payload: { data, time: Date.now() }
  });
  const fetchErrorAction = (
    error: string
  ): {
    type: typeof FETCH_ERROR,
    payload: {
      error: string,
      time: number
    }
  } => ({
    type: FETCH_ERROR,
    payload: { error, time: Date.now() }
  });

  type TFetchAction = $ReturnType<typeof fetchStartAction>;
  type TSuccessAction = $ReturnType<typeof fetchSuccessAction>;
  type TErrorAction = $ReturnType<typeof fetchErrorAction>;

  return {
    initialState,
    reducer: (
      state: State = initialState,
      action: TFetchAction | TSuccessAction | TErrorAction
    ) => {
      if (action.type === FETCH_START) {
        return {
          ...state,
          loading: true
        };
      }
      if (action.type === FETCH_SUCCESS) {
        return {
          ...state,
          data: {
            ...state.data,
            ...action.payload.data
          },
          lastFetch: action.payload.time,
          error: null,
          lastError: null,
          loading: false
        };
      }
      if (action.type === FETCH_ERROR) {
        return {
          ...state,
          lastError: action.payload.time,
          error: action.payload.error,
          loading: false
        };
      }
      return state;
    },
    actions: {
      fetchStart: fetchStartAction,
      fetchSuccess: fetchSuccessAction,
      fetchError: fetchErrorAction
    },
    selectors: {
      selectCurrentError: createSelectCurrentError(selectLocalState),
      selectLastError: createSelectLastError(selectLocalState),
      selectLastFetch: createSelectLastFetch(selectLocalState),
      selectIsLoading: createSelectIsLoading(selectLocalState)
    }
  };
};
