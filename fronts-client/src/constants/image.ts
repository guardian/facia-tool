import pageConfig from 'util/extractConfigFromPage';

export const SUPPORT_PORTRAIT_CROPS =
  pageConfig?.userData?.featureSwitches.find(
    (feature) => feature.key === 'support-portrait-crops'
  )?.enabled || false;

export const landScapeCardImageCriteria = {
  minWidth: 400,
  widthAspectRatio: 5,
  heightAspectRatio: 3,
};

export const portraitCardImageCriteria = {
  minWidth: 400,
  widthAspectRatio: 4,
  heightAspectRatio: 5,
};

//TO DO - get the right list of types
export const COLLECTIONS_USING_PORTRAIT_TRAILS = ['fixed/small/slow-IV'];

export const defaultCardTrailImageCriteria = landScapeCardImageCriteria;

export const editionsCardImageCriteria = {
  minWidth: 400,
};

export const editionsMobileCardImageCriteria = {
  minWidth: 400,
};

export const editionsTabletCardImageCriteria = {
  minWidth: 400,
};

export const gridDataTransferTypes = {
  cropsData: 'application/vnd.mediaservice.crops+json',
  gridUrl: 'application/vnd.mediaservice.kahuna.uri',
  imageData: 'application/vnd.mediaservice.image+json',
};

export const DRAG_DATA_CARD_IMAGE_OVERRIDE = '@@drag_collection_item_image@@';
export const DRAG_DATA_GRID_IMAGE_URL = '@@drag_grid_image_url@@';
