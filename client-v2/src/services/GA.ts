/**
 * For this to work as expected this script tag needs to exist in the <head></head> tag:
 *
 * <script async src="https://www.googletagmanager.com/gtag/js?id=UA-78290349-2"></script>
 */

/**
 * Custom dimensions need to be added here such that we can send events like
 *
 * `gtag('event', 'drop_article', { front_id: 'my_id_134' })`
 */
const DIMENSION_MAP = {
  dimension1: 'front_id',
  dimension2: 'drag_source'
};

const w: any = window;
w.dataLayer = w.dataLayer || [];

function gtag(...args: any[]) {
  w.dataLayer.push(...args);
}

const init = () => {
  gtag('js', new Date());
  gtag('config', 'UA-78290349-2', {
    custom_map: DIMENSION_MAP
  });
};

const events = {
  addFront: (frontId: string) =>
    gtag('event', 'add_front', {
      front_id: frontId // either front id or 'clipboard'
    }),
  removeFront: (frontId: string) =>
    gtag('event', 'remove_front', {
      front_id: frontId
    }),
  dropArticle: (frontId: string, source?: string) =>
    gtag('event', 'drop_article', {
      front_id: frontId,
      drag_source: source // 'feed', 'url', 'collection' etc.
    }),
  overviewItemClicked: (frontId: string) =>
    gtag('event', 'overview_item_clicked', {
      front_id: frontId
    }),
  collectionToggleClicked: (frontId: string) =>
    gtag('event', 'collection_toggle_clicked', {
      front_id: frontId
    }),
  collectionPublished: (frontId: string, collectionId: string) =>
    gtag('event', 'collection_published', {
      collection_id: collectionId,
      front_id: frontId
    })
};

export { init, events };
