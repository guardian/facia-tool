import { select } from '../helpers';

const FRONT_SELECTOR = 'test/front';
const FEED_ITEM_SELECTOR = 'feed-item';
const HEADLINE_SELECTOR = 'headline';
const DROP_ZONE_SELECTOR = 'drop-zone';

const maybeGetNth = selector => (n = null) =>
  n === null ? selector : selector.nth(n);

export const feedItem = maybeGetNth(select(FEED_ITEM_SELECTOR));

export const frontHeadline = maybeGetNth(
  select(FRONT_SELECTOR, HEADLINE_SELECTOR)
);
export const feedItemHeadline = maybeGetNth(
  select(FEED_ITEM_SELECTOR, HEADLINE_SELECTOR)
);
export const frontDropZone = maybeGetNth(
  select(FRONT_SELECTOR, DROP_ZONE_SELECTOR)
);
