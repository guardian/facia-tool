// @flow

import { without } from 'lodash';

type BaseResource = {
  id?: string
};

const FETCH_START = 'FETCH_START';
const FETCH_SUCCESS = 'FETCH_SUCCESS';
const FETCH_ERROR = 'FETCH_ERROR';
const UPDATE_START = 'UPDATE_START';
const UPDATE_SUCCESS = 'UPDATE_SUCCESS';
const UPDATE_ERROR = 'UPDATE_ERROR';

type FetchStartAction = {
  entity: string,
  type: 'FETCH_START',
  payload: { ids?: string[] | string }
};

type FetchSuccessAction<Resource> = {
  entity: string,
  type: 'FETCH_SUCCESS',
  payload: { data: Resource | Resource[] | any, time: number }
};

type FetchErrorAction = {
  entity: string,
  type: 'FETCH_ERROR',
  payload: {
    error: string,
    time: number,
    ids?: string | string[]
  }
};

type UpdateStartAction<Resource> = {
  entity: string,
  type: 'UPDATE_START',
  payload: { id?: string | string, data: Resource | any }
};

type UpdateSuccessAction<Resource> = {
  entity: string,
  type: 'UPDATE_SUCCESS',
  payload: { data: Resource | any, id: string, time: number }
};

type UpdateErrorAction = {
  entity: string,
  type: 'UPDATE_ERROR',
  payload: {
    error: string,
    id: string
  }
};

type Actions<Resource> =
  | FetchStartAction
  | FetchSuccessAction<Resource>
  | FetchErrorAction
  | UpdateStartAction<Resource>
  | UpdateSuccessAction<Resource>
  | UpdateErrorAction;

const getStatusIdsFromData = (
  data: BaseResource | BaseResource[] | any
): string[] | string =>
  data instanceof Array
    ? data.map((resource: BaseResource) => resource.id || '')
    : data.id || '';

const applyStatusIds = (
  currentIds: string[],
  incomingIds?: string | string[]
) => currentIds.concat(incomingIds || '@@ALL');

const removeStatusIds = (
  currentIds: string[],
  incomingIds?: string[] | string
) =>
  incomingIds instanceof Array
    ? without(currentIds, ...incomingIds)
    : without(currentIds, incomingIds);

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

const createSelectors = (selectLocalState: (state: any) => any) => ({
  selectCurrentError: createSelectCurrentError(selectLocalState),
  selectLastError: createSelectLastError(selectLocalState),
  selectLastFetch: createSelectLastFetch(selectLocalState),
  selectIsLoading: createSelectIsLoading(selectLocalState),
  selectIsLoadingById: createSelectIsLoadingById(selectLocalState),
  selectById: createSelectById(selectLocalState),
  selectAll: createSelectAll(selectLocalState)
});

function applyNewData<Resource: BaseResource | any>(
  data: Resource | { [id: string]: Resource } | {},
  newData: Resource | Resource[]
): Resource | { [id: string]: Resource } {
  if (newData instanceof Array) {
    return {
      ...data,
      ...newData.reduce((acc, model: Resource, index) => {
        if (!model.id) {
          throw new Error(
            `[asyncResourceBundle]: Cannot apply new data - model is missing ID at index ${index}.`
          );
        }
        return {
          ...acc,
          [model.id]: model
        };
      }, {})
    };
  }

  if (!newData.id) {
    throw new Error(
      `[asyncResourceBundle]: Cannot apply new data - model with keys ${Object.keys(
        newData
      ).join(', ')} is missing id.`
    );
  }

  return {
    ...data,
    [newData.id]: newData
  };
}

type State<Resource> = {
  data: Resource | { [id: string]: Resource } | any,
  lastError: string | null,
  error: string | null,
  lastFetch: number | null,
  loadingIds: string[],
  updatingIds: string[]
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
 * @todo The any type here is a massive cop-out to cope with the fact
 * that the shape of the resource might be keyed by ID, or just a blob
 * of state that we don't index. Solutions welcome!
 */
function createAsyncResourceBundle<Resource: BaseResource | any>(
  // The name of the entity for which this reducer is responsible
  entityName: string,
  options: {|
    // The key the reducer provided by this bundle is mounted at.
    // Defaults to entityName if none is given.
    selectLocalState?: (state: any) => any,
    // Do we index the incoming data by id, or just add it to the state as-is?
    indexById?: boolean,
    // Provides a namespace for the created actions, separated by a slash,
    // e.g.the resource 'books' namespaced with 'shared' becomes SHARED/BOOKS
    namespace?: string,
    // The initial state of the reducer data. Defaults to null.
    initialData?: any
  |} = {
    indexById: false,
    initialData: {}
  }
) {
  const { indexById } = options;
  const selectLocalState = options.selectLocalState
    ? options.selectLocalState
    : (state: any) => state[entityName];

  const initialState: State<Resource | any> = {
    data: options.initialData || {},
    lastError: null,
    error: null,
    lastFetch: null,
    loading: false,
    loadingIds: [],
    updatingIds: []
  };

  const fetchStartAction = (ids?: string[] | string): FetchStartAction => ({
    entity: entityName,
    type: FETCH_START,
    payload: { ids }
  });

  const fetchSuccessAction = (
    data: Resource | Resource[] | any
  ): FetchSuccessAction<Resource> => ({
    entity: entityName,
    type: FETCH_SUCCESS,
    payload: { data, time: Date.now() }
  });

  const fetchErrorAction = (
    error: string,
    ids?: string | string[]
  ): FetchErrorAction => ({
    entity: entityName,
    type: FETCH_ERROR,
    payload: { error, ids, time: Date.now() }
  });

  const updateStartAction = (data: Resource): UpdateStartAction<Resource> => ({
    entity: entityName,
    type: UPDATE_START,
    payload: { data }
  });

  const updateSuccessAction = (
    id: string,
    data: Resource
  ): UpdateSuccessAction<Resource> => ({
    entity: entityName,
    type: UPDATE_SUCCESS,
    payload: { id, data, time: Date.now() }
  });

  const updateErrorAction = (error: string, id: string): UpdateErrorAction => ({
    entity: entityName,
    type: UPDATE_ERROR,
    payload: { error, id, time: Date.now() }
  });

  return {
    initialState,
    reducer: (
      state: State<Resource> = initialState,
      action: Actions<Resource>
    ): State<Resource> => {
      // The entity property lets us scope by module, whilst keeping
      // the 'type' property typed as string literal unions.
      if (action.entity !== entityName) {
        return state;
      }

      if (action.type === FETCH_START) {
        return {
          ...state,
          loadingIds: applyStatusIds(state.loadingIds, action.payload.ids)
        };
      }

      if (action.type === FETCH_SUCCESS) {
        return {
          ...state,
          data: !indexById
            ? action.payload.data
            : applyNewData(state.data, action.payload.data),
          lastFetch: action.payload.time,
          error: null,
          loadingIds: indexById
            ? removeStatusIds(
                state.loadingIds,
                getStatusIdsFromData(action.payload.data)
              )
            : []
        };
      }

      if (action.type === FETCH_ERROR) {
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
            ? removeStatusIds(state.loadingIds, action.payload.ids)
            : []
        };
      }

      if (action.type === UPDATE_START) {
        return {
          ...state,
          data: !indexById
            ? action.payload.data
            : applyNewData(state.data, action.payload.data),
          updatingIds: applyStatusIds(
            state.updatingIds,
            indexById ? action.payload.data.id : undefined
          )
        };
      }

      if (action.type === UPDATE_SUCCESS) {
        return {
          ...state,
          data: !indexById
            ? action.payload.data
            : applyNewData(state.data, action.payload.data),
          lastFetch: action.payload.time,
          error: null,
          updateIds: removeStatusIds(state.updatingIds, action.payload.id)
        };
      }

      if (action.type === UPDATE_ERROR) {
        return {
          ...state,
          error: action.payload.error,
          updateIds: removeStatusIds(state.updatingIds, action.payload.id)
        };
      }
      return state;
    },
    actionNames: {
      fetchStart: FETCH_START,
      fetchSuccess: FETCH_SUCCESS,
      fetchError: FETCH_ERROR,
      updateStart: UPDATE_START,
      updateSuccess: UPDATE_SUCCESS,
      updateError: UPDATE_ERROR
    },
    actions: {
      fetchStart: fetchStartAction,
      fetchSuccess: fetchSuccessAction,
      fetchError: fetchErrorAction,
      updateStart: updateStartAction,
      updateSuccess: updateSuccessAction,
      updateError: updateErrorAction
    },
    selectors: createSelectors(selectLocalState)
  };
}

export type { Actions, State };
export default createAsyncResourceBundle;
