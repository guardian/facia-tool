import { Stages, CollectionItemSets } from 'shared/types/Collection';
import { gridDataTransferTypes } from './image';

export const breakingNewsFrontId: string = 'breaking-news';

export const clipboardId: string = 'clipboard';

export const frontStages: { [key: string]: Stages } = {
  draft: 'draft',
  live: 'live'
};

export const collectionItemSets: { [key: string]: CollectionItemSets } = {
  ...frontStages,
  previously: 'previously'
};

export const notLiveLabels: { [key: string]: string } = {
  draft: 'Draft',
  takenDown: 'Taken Down'
};

export const liveBlogTones: { [key: string]: string } = {
  dead: 'dead',
  live: 'live'
};

export const collectionEventsBlacklist = Object.values(gridDataTransferTypes);

export const detectPressFailureMs = 10000;

export const noOfOpenCollectionsOnFirstLoad = 3;
