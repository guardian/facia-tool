import { select } from '../helpers';

const FRONT_SELECTOR = 'test/front';
const FEED_ITEM_SELECTOR = 'feed-item';
const COLLECTION_ITEM_SELECTOR = 'article-body';
const CLIPBOARD_SELECTOR = 'clipboard';
const HEADLINE_SELECTOR = 'headline';
const DROP_ZONE_SELECTOR = 'drop-zone';
const HOVER_OVERLAY_SELECTOR = 'hover-overlay';
const ADD_TO_CLIPBOARD_BUTTON = 'add-to-clipboard-hover-button';
const SNAP_SELECTOR = 'snap';
// Html Mocks //
const GUARDIAN_TAG_ANCHOR = 'guardian-tag';
const EXTERNAL_LINK_ANCHOR = 'external-link';

const maybeGetNth = selector => (n = null) =>
  n === null ? selector : selector.nth(n);

// Feed //
export const feedItem = maybeGetNth(select(FEED_ITEM_SELECTOR));
export const feedItemHeadline = maybeGetNth(
  select(FEED_ITEM_SELECTOR, HEADLINE_SELECTOR)
);
export const feedItemHoverZone = maybeGetNth(
  select(FEED_ITEM_SELECTOR, HOVER_OVERLAY_SELECTOR)
);

// Clipboard //
export const clipboardDropZone = maybeGetNth(
  select(CLIPBOARD_SELECTOR, DROP_ZONE_SELECTOR)
);
export const clipboardItem = maybeGetNth(
  select(CLIPBOARD_SELECTOR, COLLECTION_ITEM_SELECTOR)
);
export const clipboardItemTruncatedHeadline = maybeGetNth(
  select(CLIPBOARD_SELECTOR, COLLECTION_ITEM_SELECTOR, HEADLINE_SELECTOR)
);
export const feedItemAddToClipboardHoverButton = maybeGetNth(
  select(FEED_ITEM_SELECTOR, ADD_TO_CLIPBOARD_BUTTON)
);

// Fronts //
export const frontHeadline = maybeGetNth(
  select(FRONT_SELECTOR, HEADLINE_SELECTOR)
);
export const frontDropZone = maybeGetNth(
  select(FRONT_SELECTOR, DROP_ZONE_SELECTOR)
);
export const frontItemAddToClipboardHoverButton = maybeGetNth(
  select(FRONT_SELECTOR, ADD_TO_CLIPBOARD_BUTTON)
);
export const collectionItemHoverZone = maybeGetNth(
  select(COLLECTION_ITEM_SELECTOR, HOVER_OVERLAY_SELECTOR)
);

// Snaps //
export const guardianSnapLink = maybeGetNth(select(GUARDIAN_TAG_ANCHOR));
export const externalSnapLink = maybeGetNth(select(EXTERNAL_LINK_ANCHOR));
export const frontSnapLink = maybeGetNth(select(SNAP_SELECTOR));
