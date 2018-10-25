import { Stages } from 'shared/types/Collection';

export const breakingNewsFrontId: string = 'breaking-news';

export const clipboardId: string = 'clipboard';

export const frontStages: { [key: string]: Stages } = {
  draft: 'draft',
  live: 'live',
  previously: 'previously'
};

export const notLiveLabels: { [key: string]: string } = {
  draft: 'Draft',
  takenDown: 'Taken Down'
};

export const detectPressFailureMs = 10000;
