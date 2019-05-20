export const articleFragmentImageCriteria = {
  minWidth: 400,
  widthAspectRatio: 5,
  heightAspectRatio: 3
};

export const gridDataTransferTypes = {
  cropsData: 'application/vnd.mediaservice.crops+json',
  gridUrl: 'application/vnd.mediaservice.kahuna.uri',
  imageData: 'application/vnd.mediaservice.image+json'
};

// Represents a collectionItem's current image override.
export const DRAG_DATA_COLLECTION_ITEM_IMAGE_OVERRIDE =
  '@@drag_collection_item_image@@';

// Represents a complete set of image data.
export const DRAG_DATA_IMAGE = '@@drag_grid_image_url@@';
