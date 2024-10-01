/**
 * Custom dimensions need to be added here such that we can send events like
 *
 * `gtag('event', 'drop_article', { front_id: 'my_id_134' })`
 */
const DIMENSION_MAP = {
	dimension1: 'front_id',
	dimension2: 'drag_source',
	dimension3: 'collection_id',
	dimension4: 'version',
};

console.info('Google Analytics tracking has been disabled');
const gtag = (command: string, params1: any, params2?: any) => {};

// we keep this init here so that if we decide to type `gtag` then we can use
// DIMENSION_MAP to help type it
const init = () => {
	gtag('set', {
		custom_map: DIMENSION_MAP,
		version: '2',
	});
};

type ImageAdditionMethod =
	| 'drop'
	| 'drop-into-card'
	| 'paste'
	| 'click to modal';

// NOTE: you are unable to set custom dimensions on events, so the final gtag argument {} being passed in below are not currently working.
const events = {
	addFront: (frontId: string) =>
		gtag('event', 'add_front', {
			front_id: frontId, // either front id or 'clipboard'
		}),
	moveFront: (frontId: string) =>
		gtag('event', 'move_front', {
			front_id: frontId, // either front id or 'clipboard'
		}),
	removeFront: (frontId: string) =>
		gtag('event', 'remove_front', {
			front_id: frontId,
		}),
	dropArticle: (frontId: string, source?: string) =>
		gtag('event', 'drop_article', {
			front_id: frontId,
			drag_source: source, // 'feed', 'url', 'collection' etc.
		}),
	overviewItemClicked: (frontId: string) =>
		gtag('event', 'overview_item_clicked', {
			front_id: frontId,
		}),
	collectionToggleClicked: (frontId: string) =>
		gtag('event', 'collection_toggle_clicked', {
			front_id: frontId,
		}),
	collectionPublished: (frontId: string, collectionId: string) =>
		gtag('event', 'collection_published', {
			collection_id: collectionId,
			front_id: frontId,
		}),
	imageAdded: (frontId: string, method: ImageAdditionMethod) =>
		gtag('event', `image_added: ${method}`, {
			front_id: frontId,
			method,
		}),
};

export { init, events, gtag };
