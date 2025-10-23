declare module '*.svg' {
	const content: any;
	export default content;
}

declare module '*.gif' {
	const content: any;
	export default content;
}

declare module '*.woff' {
	const content: any;
	export default content;
}

declare module '*.ttf' {
	const content: any;
	export default content;
}

declare module '*.woff2' {
	const content: any;
	export default content;
}

declare module 'grid-util-js' {
	const content: any;
	export default content;
}

declare module 'panda-session' {
	const content: any;
	export const reEstablishSession: any;
	export default content;
}

declare module 'normalise-with-fields' {
	export const createType: any;
	export const build: any;
	export const createFieldType: any;
}

declare module 'tti-polyfill' {
	const content: any;
	export default content;
}

// Added as @types/react-router-redux imports an older, incompatible version of redux types.
declare module 'react-router-redux' {
	import {
		History,
		Location,
		LocationDescriptor,
		LocationState,
		Path,
	} from 'history';
	import * as React from 'react';
	import { match } from 'react-router';
	import { Action, Dispatch, Middleware, Reducer, Store } from 'redux';
	export interface ConnectedRouterProps<State> {
		children?: React.ReactNode;
		store?: Store<State> | undefined;
		history: History;
	}
	export class ConnectedRouter<State> extends React.Component<
		ConnectedRouterProps<State>
	> {}

	export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

	export interface RouterState {
		location: Location | null;
	}

	export const routerReducer: Reducer<RouterState, Action>;

	export const CALL_HISTORY_METHOD = '@@router/CALL_HISTORY_METHOD';

	export function push(
		location: LocationDescriptor,
		state?: LocationState,
	): RouterAction;
	export function replace(
		location: LocationDescriptor,
		state?: LocationState,
	): RouterAction;
	export function go(n: number): RouterAction;
	export function goBack(): RouterAction;
	export function goForward(): RouterAction;

	export const routerActions: {
		push: typeof push;
		replace: typeof replace;
		go: typeof go;
		goBack: typeof goBack;
		goForward: typeof goForward;
	};

	export interface LocationActionPayload {
		method: string;
		args?: any[] | undefined;
	}

	export interface RouterAction {
		type: typeof CALL_HISTORY_METHOD;
		payload: LocationActionPayload;
	}

	export interface LocationChangeAction {
		type: typeof LOCATION_CHANGE;
		payload: Location & {
			props?:
				| {
						match: {
							path: string;
							url: string;
							params: any;
							isExact: boolean;
						};
						location: Location;
						history: History;
				  }
				| undefined;
		};
	}

	export function routerMiddleware(history: History): Middleware;

	export function createMatchSelector(
		path: string,
	): (state: { router: RouterState }) => match | null;
}

declare module 'history' {
	const createBrowserHistory: { (): any };
	export { createBrowserHistory };
}
