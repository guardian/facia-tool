import { FrontsConfig } from 'types/FaciaApi';

const frontsConfig: { data: FrontsConfig } = {
  data: {
    fronts: {
      editorialFront: {
        id: 'editorialFront',
        collections: ['collection1'],
        priority: 'editorial'
      },
      commercialFront: {
        id: 'commercialFront',
        collections: ['collection1'],
        priority: 'commercial'
      }
    },
    collections: {
      collection1: {
        id: 'collection1',
        displayName: 'name',
        type: 'collection',
        uneditable: true,
        backfill: {
          type: 'capi',
          query:
            'uk/commentisfree?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true'
        }
      },
      collection2: {
        id: 'collection1',
        displayName: 'name',
        type: 'collection'
      }
    }
  }
};

export { frontsConfig };
