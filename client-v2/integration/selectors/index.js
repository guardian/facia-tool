import { select } from '../helpers';

const FRONT_SELECTOR = 'test/front';
const FEED_ITEM_SELECTOR = 'feed-item';
const CLIPBOARD_SELECTOR = 'clipboard';
const PREVIOUSLY_SELECTOR = 'previously';
const CLIPBOARD_WRAPPER_SELECTOR = 'clipboard-wrapper';
const HEADLINE_SELECTOR = 'headline';
const DROP_ZONE_SELECTOR = 'drop-zone';
const KICKER_SELECTOR = 'kicker';
const HOVER_OVERLAY_SELECTOR = 'hover-overlay';
const ADD_TO_CLIPBOARD_BUTTON = 'add-to-clipboard-hover-button';
const SNAP_SELECTOR = 'snap';
const COLLECTION_SELECTOR = 'collection';
const COLLECTION_ITEM_SELECTOR = 'article-body';
const COLLECTION_DISCARD_BUTTON = 'collection-discard-button';
const DELETE_BUTTON = 'delete-hover-button';
const EDIT_FORM = 'edit-form';
const EDIT_FORM_HEADLINE_FIELD = 'edit-form-headline-field';
const EDIT_FORM_SAVE_BUTTON = 'edit-form-save-button';
const EDIT_FORM_BREAKING_NEWS_TOGGLE = 'edit-form-breaking-news-toggle';

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
export const feedItemAddToClipboardHoverButton = maybeGetNth(
  select(FEED_ITEM_SELECTOR, ADD_TO_CLIPBOARD_BUTTON)
);
export const clipboardItemHeadline = maybeGetNth(
  select(CLIPBOARD_SELECTOR, COLLECTION_ITEM_SELECTOR, HEADLINE_SELECTOR)
);
export const clipboardItemDeleteButton = maybeGetNth(
  select(CLIPBOARD_SELECTOR, COLLECTION_ITEM_SELECTOR, DELETE_BUTTON)
);

// Collections //
export const collection = maybeGetNth(select(COLLECTION_SELECTOR));

export const allCollectionItems = collectionIndex => {
  const collectionSelected = collection(collectionIndex);
  return collectionSelected.find(`[data-testid="${COLLECTION_ITEM_SELECTOR}"]`);
};

export const allCollectionDropZones = collectionIndex => {
  const collectionSelected = collection(collectionIndex);
  return collectionSelected.find(`[data-testid="${DROP_ZONE_SELECTOR}"]`);
};

export const collectionItem = (collectionIndex, itemIndex = 0) =>
  allCollectionItems(collectionIndex).nth(itemIndex);

export const collectionDropZone = (collectionIndex, dropZoneIndex = 0) =>
  allCollectionDropZones(collectionIndex).nth(dropZoneIndex);

export const collectionItemHeadline = (collectionIndex, itemIndex = 0) =>
  collectionItem(collectionIndex, itemIndex).find(
    `[data-testid="${HEADLINE_SELECTOR}"]`
  );

export const collectionItemKicker = (collectionIndex, itemIndex = 0) =>
  collectionItem(collectionIndex, itemIndex).find(
    `[data-testid="${KICKER_SELECTOR}"]`
  );

export const collectionDiscardButton = collectionIndex =>
  collection(collectionIndex).find(
    `[data-testid="${COLLECTION_DISCARD_BUTTON}"]`
  );

export const collectionItemDeleteButton = (collectionIndex, itemIndex = 0) =>
  collectionItem(collectionIndex, itemIndex).find(
    `[data-testid="${DELETE_BUTTON}"]`
  );

export const collectionItemAddToClipboardButton = (
  collectionIndex,
  itemIndex = 0
) =>
  collectionItem(collectionIndex, itemIndex).find(
    `[data-testid="${ADD_TO_CLIPBOARD_BUTTON}"]`
  );

// Edit form //
export const editForm = maybeGetNth(select(EDIT_FORM));

export const editFormHeadlineInput = maybeGetNth(
  select(EDIT_FORM, EDIT_FORM_HEADLINE_FIELD)
);

export const editFormSaveButton = maybeGetNth(select(EDIT_FORM_SAVE_BUTTON));

export const editFormBreakingNewsToggle = maybeGetNth(
  select(EDIT_FORM_BREAKING_NEWS_TOGGLE)
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

// Snaps //
export const guardianSnapLink = maybeGetNth(select(GUARDIAN_TAG_ANCHOR));
export const externalSnapLink = maybeGetNth(select(EXTERNAL_LINK_ANCHOR));
export const frontSnapLink = maybeGetNth(select(SNAP_SELECTOR));

// Previously //
export const previouslyToggle = () => select(PREVIOUSLY_SELECTOR);
export const previouslyItem = maybeGetNth(
  select(PREVIOUSLY_SELECTOR, COLLECTION_ITEM_SELECTOR)
);
// there should be none of these ever!
export const previouslyDropZone = maybeGetNth(
  select(PREVIOUSLY_SELECTOR, DROP_ZONE_SELECTOR)
);
export const clipboardWrapper = () => select(CLIPBOARD_WRAPPER_SELECTOR);
