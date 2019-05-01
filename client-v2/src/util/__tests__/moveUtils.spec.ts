import {
  getFromGroupIndecesWithRespectToState,
  getToGroupIndecesWithRespectToState
} from '../moveUtils';

describe('Move utilities', () => {
  const state: any = {
    collections: {
      data: {
        c1: {
          id: 'c1',
          groups: ['group1', 'group2'],
          live: ['g1', 'g2']
        },
        c2: {
          id: 'c2',
          groups: ['group3', 'group4', 'group5'],
          draft: ['g5', 'g4', 'g3']
        }
      }
    },
    groups: {
      g1: {
        uuid: 'g1',
        name: 'g1'
      },
      g2: {
        uuid: 'g2',
        id: 'group2',
        articleFragments: ['af1'],
        name: 'g2'
      },
      g3: {
        uuid: 'g3',
        id: 'group3',
        name: 'group3',
        articleFragments: ['af3', 'af4']
      },
      g4: {
        uuid: 'g4',
        id: 'group4',
        articleFragments: ['af5']
      },
      g5: {
        uuid: 'g5',
        id: 'group5',
        articleFragments: ['af6']
      }
    }
  };

  const position = { type: 'group', id: 'g1', index: 2 };
  const positionWithOrphanedGroups = { type: 'group', id: 'g3', index: 3 };
  const positionInOrphanedGroup = { type: 'group', id: 'g3', index: 0 };
  describe('getFromGroupIndecesWithRespectToState', () => {
    it('it returns null if position is null', () => {
      const { fromWithRespectToState } = getFromGroupIndecesWithRespectToState(
        null,
        state
      );

      expect(fromWithRespectToState).toBeNull();
    });

    it('does not modify the position if there are no orphaned groups', () => {
      const { fromWithRespectToState } = getFromGroupIndecesWithRespectToState(
        position,
        state
      );

      expect(fromWithRespectToState).toEqual(position);
    });

    it('moves the article from the correct index when orphaned groups', () => {
      const { fromWithRespectToState } = getFromGroupIndecesWithRespectToState(
        positionWithOrphanedGroups,
        state
      );

      expect(fromWithRespectToState).toEqual({
        ...positionWithOrphanedGroups,
        index: 1
      });
    });

    it('moves articles correctly from orphaned groups', () => {
      const { fromWithRespectToState } = getFromGroupIndecesWithRespectToState(
        positionInOrphanedGroup,
        state
      );
      expect(fromWithRespectToState).toEqual({
        ...positionInOrphanedGroup,
        index: 0,
        id: 'g5'
      });
    });
  });

  describe('getToGroupIndecesWithRespectToState', () => {
    it('does not modify the position if there are no orphaned groups', () => {
      const notTransformedPosition = getToGroupIndecesWithRespectToState(
        position,
        state,
        false
      );

      expect(position).toEqual(notTransformedPosition);
    });

    it('moves the article to the correct index when there are orphaned groups', () => {
      const toWithRespectToState = getToGroupIndecesWithRespectToState(
        positionWithOrphanedGroups,
        state,
        false
      );

      expect(toWithRespectToState).toEqual({
        ...positionWithOrphanedGroups,
        index: 1
      });
    });

    it('moves articles coming from orphaned groups correctly', () => {
      const toWithRespectToState = getToGroupIndecesWithRespectToState(
        positionWithOrphanedGroups,
        state,
        true
      );

      expect(toWithRespectToState).toEqual({
        ...positionWithOrphanedGroups,
        index: 2
      });
    });

    it('does not move articles to orphaned groups', () => {
      const toWithRespectToState = getToGroupIndecesWithRespectToState(
        positionInOrphanedGroup,
        state,
        true
      );

      expect(toWithRespectToState).toBeNull();
    });
  });
});
