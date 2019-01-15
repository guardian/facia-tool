import reducer, {
  editorOpenFrontPure as editorOpenFront,
  editorCloseFrontPure as editorCloseFront,
  editorClearOpenFronts,
  editorSetOpenFronts,
  editorOpenCollections,
  editorCloseCollections
} from '../frontsUIBundle';

describe('frontsUIBundle', () => {
  describe('reducer', () => {
    it('should add a front to the open editor fronts', () => {
      const state = reducer(undefined, editorOpenFront('exampleFront') as any);
      expect(state.frontIds).toEqual(['exampleFront']);
    });
    it('should remove a front to the open editor fronts', () => {
      const state = reducer(
        { frontIds: ['front1', 'front2'] } as any,
        editorCloseFront('front1')
      );
      expect(state.frontIds).toEqual(['front2']);
    });
    it('should clear fronts to the open editor fronts', () => {
      const state = reducer(
        { frontIds: ['front1', 'front2'] } as any,
        editorClearOpenFronts()
      );
      expect(state.frontIds).toEqual([]);
    });
    it('should set the fronts to the open editor fronts', () => {
      const state = reducer(
        { frontIds: ['front1', 'front2'] } as any,
        editorSetOpenFronts(['front1', 'front3'])
      );
      expect(state.frontIds).toEqual(['front1', 'front3']);
    });
    it('should add a collection to the open editor collections', () => {
      const state = reducer(undefined, editorOpenCollections(
        'exampleCollection'
      ) as any);
      expect(state.collectionIds).toEqual(['exampleCollection']);
    });
    it('should add multiple collections to the open editor collections', () => {
      const state = reducer(undefined, editorOpenCollections([
        'exampleCollection',
        'exampleCollection2'
      ]) as any);
      expect(state.collectionIds).toEqual([
        'exampleCollection',
        'exampleCollection2'
      ]);
    });
    it('should remove multiple collections from the open editor collections', () => {
      const state = reducer(
        { collectionIds: ['collection1', 'collection2'] } as any,
        editorCloseCollections(['collection1', 'collection2'])
      );
      expect(state.collectionIds).toEqual([]);
    });
  });
});
