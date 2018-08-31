import reducer, {
  editorOpenFront,
  editorCloseFront,
  editorClearOpenFronts,
  editorSetOpenFronts
} from '../frontsUIBundle';

describe('frontsUIBundle', () => {
  describe('reducer', () => {
    it('should add a front to the open editor fronts', () => {
      const state = reducer(undefined, editorOpenFront('exampleFront'));
      expect(state.frontIds).toEqual(['exampleFront']);
    });
    it('should remove a front to the open editor fronts', () => {
      const state = reducer(
        { frontIds: ['front1', 'front2'] },
        editorCloseFront('front1')
      );
      expect(state.frontIds).toEqual(['front2']);
    });
    it('should clear fronts to the open editor fronts', () => {
      const state = reducer(
        { frontIds: ['front1', 'front2'] },
        editorClearOpenFronts('front1')
      );
      expect(state.frontIds).toEqual([]);
    });
    it('should set the fronts to the open editor fronts', () => {
      const state = reducer(
        { frontIds: ['front1', 'front2'] },
        editorSetOpenFronts(['front1', 'front3'])
      );
      expect(state.frontIds).toEqual(['front1', 'front3']);
    });
  });
});
