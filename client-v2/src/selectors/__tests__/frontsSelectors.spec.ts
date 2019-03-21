import {
  getFrontsWithPriority,
  alsoOnFrontSelector
} from 'selectors/frontsSelectors';
import { frontsConfig } from 'fixtures/frontsConfig';
import { FrontConfig } from 'types/FaciaApi';

const editorialFrontsInConfig: FrontConfig[] = [
  { collections: ['collection1'], id: 'editorialFront', priority: 'editorial' },
  { collections: ['collection6'], id: 'editorialFront2', priority: 'editorial' }
];

const additionalEditorialFronts: FrontConfig[] = [
  {
    collections: ['collection2'],
    id: 'editorialNotShared',
    priority: 'editorial'
  },
  {
    collections: ['collection5', 'collection3'],
    id: 'editorialSharedWithTraining',
    priority: 'editorial'
  }
];

const trainingFronts: FrontConfig[] = [
  {
    collections: ['collection3'],
    id: 'trainingFront',
    priority: 'training'
  }
];

const commercialFronts: FrontConfig[] = [
  {
    collections: ['collection1'],
    id: 'commercialFront',
    priority: 'commercial'
  }
];

describe('Filtering fronts correctly', () => {
  it('return an empty array if config is empty', () => {
    expect(
      getFrontsWithPriority(
        {
          fronts: {
            frontsConfig: {
              data: {
                fronts: {}
              }
            }
          }
        } as any,
        'editorial'
      )
    ).toEqual([]);
  });

  it('filters editorial fronts correctly', () => {
    expect(
      getFrontsWithPriority(
        {
          fronts: {
            frontsConfig
          }
        } as any,
        'editorial'
      )
    ).toEqual(editorialFrontsInConfig);
  });

  it('filters non-editorial fronts correctly', () => {
    expect(
      getFrontsWithPriority(
        {
          fronts: {
            frontsConfig
          }
        } as any,
        'commercial'
      )
    ).toEqual(commercialFronts);
  });
});

const allFronts = editorialFrontsInConfig
  .concat(additionalEditorialFronts)
  .concat(trainingFronts.concat(commercialFronts));

describe('Selecting which front collection is also on correctly', () => {
  it('fills in also details for all collections on a front', () => {
    expect(
      alsoOnFrontSelector(
        additionalEditorialFronts.find(
          front => front.id === 'editorialSharedWithTraining'
        ),
        allFronts
      )
    ).toEqual(
      expect.objectContaining({
        collection3: expect.any(Object),
        collection5: expect.any(Object)
      })
    );
  });

  it('returns an empty list of fronts for collection which is not shared', () => {
    expect(
      alsoOnFrontSelector(
        additionalEditorialFronts.find(
          front => front.id === 'editorialNotShared'
        ),
        allFronts
      )
    ).toEqual({
      collection2: { priorities: [], meritsWarning: false, fronts: [] }
    });
  });

  it('returns correct list of shared fronts and priorities for shared collections', () => {
    expect(
      alsoOnFrontSelector(
        trainingFronts.find(front => front.id === 'trainingFront'),
        allFronts
      )
    ).toEqual({
      collection3: {
        priorities: ['editorial'],
        meritsWarning: false,
        fronts: [{ id: 'editorialSharedWithTraining', priority: 'editorial' }]
      }
    });
  });

  it('sets merit warning to false if shared collection appears on a commercial front', () => {
    expect(
      alsoOnFrontSelector(
        commercialFronts.find(front => front.id === 'commercialFront'),
        allFronts
      )
    ).toEqual({
      collection1: {
        priorities: ['editorial'],
        meritsWarning: false,
        fronts: [{ id: 'editorialFront', priority: 'editorial' }]
      }
    });
  });

  it('sets merits warnign to true if a commercial collection is shared on another priority', () => {
    expect(
      alsoOnFrontSelector(
        editorialFrontsInConfig.find(front => front.id === 'editorialFront'),
        allFronts
      )
    ).toEqual({
      collection1: {
        priorities: ['commercial'],
        meritsWarning: true,
        fronts: [{ id: 'commercialFront', priority: 'commercial' }]
      }
    });
  });
});
