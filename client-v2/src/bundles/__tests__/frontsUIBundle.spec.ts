import reducer, {
  editorOpenFront,
  editorCloseFront,
  editorClearOpenFronts,
  editorSetOpenFronts
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
        editorClearOpenFronts('front1')
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
  });
});
