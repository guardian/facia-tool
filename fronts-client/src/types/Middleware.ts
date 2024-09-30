export type PersistTo =
	| 'collection'
	| 'clipboard'
	| 'openFrontIds'
	| 'favouriteFrontIds';

export type Entity = 'collection';

export interface PersistMeta {
	// The resource to persist the data to
	persistTo: PersistTo;
	// The id to to search for in this resource
	id?: string;
	// The key to take from the action payload if it is not specified. Defaults to
	// 'id'.
	key?: string;
	// Should we find collection parents before or after the reducer is called?
	// This is important when the relevant collection is affected by when the operation
	// occurs - finding the parent collection before a remove operation, for example,
	// or after an add operation.
	applyBeforeReducer?: boolean;
	// Entity to which the Action id refers to
	entity?: Entity;
}
