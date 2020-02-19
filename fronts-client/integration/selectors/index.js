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
const CARD_SELECTOR = 'article-body';
const COLLECTION_DISCARD_BUTTON = 'collection-discard-button';
const COLLECTION_LAUNCH_BUTTON = 'collection-launch-button';
const DELETE_BUTTON = 'delete-hover-button';
const EDIT_FORM = 'edit-form';
const EDIT_FORM_HEADLINE_FIELD = 'edit-form-headline-field';
const EDIT_FORM_SAVE_BUTTON = 'edit-form-save-button';
const EDIT_FORM_BREAKING_NEWS_TOGGLE = 'edit-form-breaking-news-toggle';
const BREAKING_NEWS_SELECTOR = 'breaking-news';
const EDIT_FORM_RICH_TEXT = 'edit-form-rich-text';
const EDIT_FORM_BOLD_BUTTON = 'bold';
const EDIT_FORM_ADD_LINK_BUTTON = 'add-link';
const EDIT_FORM_REMOVE_LINK_BUTTON = 'remove-link';
const EDIT_FORM_PROSEMIRROR_CLASS = '.ProseMirror';

const RENAME_FRONT_BUTTON = 'rename-front-button';
const RENAME_FRONT_INPUT = 'rename-front-input';
const FRONT_NAME = 'front-name';

const FRONTS_MENU_BUTTON = 'fronts-menu-button';
const FRONTS_MENU_ITEM = 'fronts-menu-item';
const PREFILL_BUTTON = 'prefill-button';

const PUBLISH_EDITION_BUTTON = 'publish-edition-button';
const OPTIONS_MODAL = 'options-modal';

// Html Mocks //
const GUARDIAN_TAG_ANCHOR = 'guardian-tag';
const EXTERNAL_LINK_ANCHOR = 'external-link';

const DRAG_TO_ADD_SNAP = 'drag-to-add-snap';

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
  select(CLIPBOARD_SELECTOR, CARD_SELECTOR)
);
export const feedItemAddToClipboardHoverButton = maybeGetNth(
  select(FEED_ITEM_SELECTOR, ADD_TO_CLIPBOARD_BUTTON)
);
export const clipboardItemHeadline = maybeGetNth(
  select(CLIPBOARD_SELECTOR, CARD_SELECTOR, HEADLINE_SELECTOR)
);
export const clipboardItemDeleteButton = maybeGetNth(
  select(CLIPBOARD_SELECTOR, CARD_SELECTOR, DELETE_BUTTON)
);

// Collections //
export const collection = maybeGetNth(select(COLLECTION_SELECTOR));

export const allCards = collectionIndex => {
  const collectionSelected = collection(collectionIndex);
  return collectionSelected.find(`[data-testid="${CARD_SELECTOR}"]`);
};

export const allSnaps = collectionIndex => {
  const collectionSelected = collection(collectionIndex);
  return collectionSelected.find(`[data-testid="${SNAP_SELECTOR}"]`);
};

export const allCollectionDropZones = collectionIndex => {
  const collectionSelected = collection(collectionIndex);
  return collectionSelected.find(`[data-testid="${DROP_ZONE_SELECTOR}"]`);
};

export const card = (collectionIndex, itemIndex = 0) =>
  allCards(collectionIndex).nth(itemIndex);

export const snap = (collectionIndex, itemIndex = 0) =>
  allSnaps(collectionIndex).nth(itemIndex);

export const collectionDropZone = (collectionIndex, dropZoneIndex = 0) =>
  allCollectionDropZones(collectionIndex).nth(dropZoneIndex);

export const cardHeadline = (collectionIndex, itemIndex = 0) =>
  card(collectionIndex, itemIndex).find(`[data-testid="${HEADLINE_SELECTOR}"]`);

export const snapHeadline = (collectionIndex, itemIndex = 0) =>
  snap(collectionIndex, itemIndex).find(`[data-testid="${HEADLINE_SELECTOR}"]`);

export const cardKicker = (collectionIndex, itemIndex = 0) =>
  card(collectionIndex, itemIndex).find(`[data-testid="${KICKER_SELECTOR}"]`);

export const cardBreakingNews = (collectionIndex, itemIndex = 0) =>
  card(collectionIndex, itemIndex).find(
    `[data-testid="${BREAKING_NEWS_SELECTOR}"]`
  );

export const collectionDiscardButton = collectionIndex =>
  collection(collectionIndex).find(
    `[data-testid="${COLLECTION_DISCARD_BUTTON}"]`
  );

export const collectionLaunchButton = collectionIndex =>
  collection(collectionIndex).find(
    `[data-testid="${COLLECTION_LAUNCH_BUTTON}"]`
  );

export const cardDeleteButton = (collectionIndex, itemIndex = 0) =>
  card(collectionIndex, itemIndex).find(`[data-testid="${DELETE_BUTTON}"]`);

export const cardAddToClipboardButton = (collectionIndex, itemIndex = 0) =>
  card(collectionIndex, itemIndex).find(
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

export const editFormRichText = maybeGetNth(
  select(EDIT_FORM_RICH_TEXT).find(EDIT_FORM_PROSEMIRROR_CLASS)
);

export const editFormBoldButton = maybeGetNth(
  select(EDIT_FORM, EDIT_FORM_BOLD_BUTTON)
);

export const editFormAddLinkButton = maybeGetNth(
  select(EDIT_FORM, EDIT_FORM_ADD_LINK_BUTTON)
);

export const editFormRemoveLinkButton = maybeGetNth(
  select(EDIT_FORM, EDIT_FORM_REMOVE_LINK_BUTTON)
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

export const renameFrontButton = maybeGetNth(select(RENAME_FRONT_BUTTON));
export const renameFrontInput = select(RENAME_FRONT_INPUT);
export const frontName = maybeGetNth(select(FRONT_NAME));
export const publishEditionButton = select(PUBLISH_EDITION_BUTTON);
export const optionsModal = select(OPTIONS_MODAL);
export const optionsModalChoice = choice => select(choice);

// Front Menu //
export const frontsMenuButton = () => select(FRONTS_MENU_BUTTON);
export const frontsMenuItem = maybeGetNth(select(FRONTS_MENU_ITEM));

// Prefill Button //
export const prefillButton = maybeGetNth(select(PREFILL_BUTTON));

// Snaps //
export const guardianSnapLink = maybeGetNth(select(GUARDIAN_TAG_ANCHOR));
export const externalSnapLink = maybeGetNth(select(EXTERNAL_LINK_ANCHOR));
export const frontSnapLink = maybeGetNth(select(SNAP_SELECTOR));

// Previously //
export const previouslyToggle = () => select(PREVIOUSLY_SELECTOR);
export const previouslyItem = maybeGetNth(
  select(PREVIOUSLY_SELECTOR, CARD_SELECTOR)
);
// there should be none of these ever!
export const previouslyDropZone = maybeGetNth(
  select(PREVIOUSLY_SELECTOR, DROP_ZONE_SELECTOR)
);
export const clipboardWrapper = () => select(CLIPBOARD_WRAPPER_SELECTOR);

export const dragToAddSnapItem = () => select(DRAG_TO_ADD_SNAP);
