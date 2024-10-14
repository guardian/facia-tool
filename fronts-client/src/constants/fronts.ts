import { Stages, CardSets } from 'types/Collection';
import {
	gridDataTransferTypes,
	DRAG_DATA_CARD_IMAGE_OVERRIDE,
	DRAG_DATA_GRID_IMAGE_URL,
} from './image';

export const breakingNewsFrontId: string = 'breaking-news';

export const clipboardId: string = 'clipboard';

export const frontStages: { [key: string]: Stages } = {
	draft: 'draft',
	live: 'live',
};

export const cardSets: { [key: string]: CardSets } = {
	...frontStages,
	previously: 'previously',
};

export const notLiveLabels: { [key: string]: string } = {
	draft: 'Draft',
	takenDown: 'Taken Down',
};

export const liveBlogTones: { [key: string]: string } = {
	dead: 'dead',
	live: 'live',
};

// All of the drag event types that we'd like our collection drop zones
// to ignore, at any level.

export const gridDropTypes = Object.values(gridDataTransferTypes);

export const collectionDropTypeDenylist = [
	...gridDropTypes,
	DRAG_DATA_CARD_IMAGE_OVERRIDE,
	DRAG_DATA_GRID_IMAGE_URL,
];

export const detectPressFailureMs = 10000;

export const noOfOpenCollectionsOnFirstLoad = 3;
