import {
  default as innerReducer,
  editorOpenFront,
  editorCloseFront,
  editorClearOpenFronts,
  editorSetOpenFronts,
  editorOpenCollections,
  editorCloseCollections,
  selectEditorFrontIds,
  selectIsCollectionOpen,
  editorCloseOverview,
  selectIsFrontOverviewOpen,
  editorOpenOverview,
  editorCloseClipboard,
  selectIsClipboardOpen,
  editorOpenClipboard,
  editorCloseAllOverviews,
  editorOpenAllOverviews,
  createSelectEditorFrontsByPriority,
  editorMoveFront,
  selectEditorFrontIdsByPriority
} from '../frontsUIBundle';
import initialState from 'fixtures/initialState';
import { Action } from 'types/Action';
import {
  removeSupportingArticleFragment,
  removeGroupArticleFragment
} from 'shared/actions/ArticleFragments';
import { removeClipboardArticleFragment } from 'actions/Clipboard';
import { State as GlobalState } from 'types/State';

type State = ReturnType<typeof innerReducer>;

// this allows us to put _in_ our own slice of state but receive a _global_
// state so that we can test out selectors
const reducer = (state: State | undefined, action: Action): GlobalState =>
  ({
    editor: innerReducer(state, action)
  } as any);

describe('frontsUIBundle', () => {
  describe('selectors', () => {
    describe('createSelectEditorFrontsByPriority', () => {
      const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
      it('should select editor fronts by priority', () => {
        expect(
          selectEditorFrontsByPriority(initialState, { priority: 'commercial' })
            .length
        ).toEqual(1);
      });
      it('should memoize editor fronts by priority', () => {
        expect(
          selectEditorFrontsByPriority(initialState, { priority: 'commercial' })
        ).toBe(
          selectEditorFrontsByPriority(initialState, { priority: 'commercial' })
        );
      });
    });
  });
  describe('reducer', () => {
    it('should move a front within the open editor fronts by ID', () => {
      const state = {
        ...initialState.editor,
        frontIdsByPriority: { editorial: ['1', '2', '3'] }
      };
      const newState = reducer(
        state as any,
        editorMoveFront('3', 'editorial', 0)
      );
      expect(selectEditorFrontIdsByPriority(newState)).toEqual({
        editorial: ['3', '1', '2']
      });
    });
    it('should do nothing when the front is not found', () => {
      const state = {
        ...initialState.editor,
        frontIdsByPriority: { editorial: ['1', '2', '3'] }
      };
      const newState = reducer(
        state as any,
        editorMoveFront('who?', 'editorial', 0)
      );
      expect(selectEditorFrontIds(newState)).toEqual([
        'sc-johnson-partner-zone'
      ]);
    });
    it('should do nothing when the index is out of bounds', () => {
      const state = {
        ...initialState.editor,
        frontIdsByPriority: { editorial: ['1', '2', '3'] }
      };
      const newState = reducer(
        state,
        editorMoveFront('sc-johnson-partner-zone', 'editorial', 5)
      );
      expect(selectEditorFrontIds(newState)).toEqual([
        'sc-johnson-partner-zone'
      ]);
    });
    it('should add a front to the open editor fronts', () => {
      const state = reducer(undefined, editorOpenFront(
        'exampleFront',
        'editorial'
      ) as any);
      expect(selectEditorFrontIdsByPriority(state)).toEqual({
        editorial: ['exampleFront']
      });
    });
    it('should remove a front to the open editor fronts', () => {
      const state = reducer(
        { frontIdsByPriority: { editorial: ['front1', 'front2'] } } as any,
        editorCloseFront('front1', 'editorial')
      );
      expect(selectEditorFrontIdsByPriority(state)).toEqual({
        editorial: ['front2']
      });
    });
    it('should clear fronts to the open editor fronts', () => {
      const state = reducer(
        { frontIds: ['front1', 'front2'] } as any,
        editorClearOpenFronts()
      );
      expect(selectEditorFrontIds(state)).toEqual([]);
      expect(selectEditorFrontIdsByPriority(state)).toEqual({});
    });
    it('should clear the article fragment selection when selected article fragments are removed from a front', () => {
      const state = reducer(
        {
          selectedArticleFragments: {
            frontId: { id: 'articleFragmentId', isSupporting: false }
          }
        } as any,
        removeGroupArticleFragment('collectionId', 'articleFragmentId')
      );
      expect(state.editor.selectedArticleFragments.frontId).toBe(undefined);
    });
    describe('Clearing article selection in response to persistence events', () => {
      const stateWithSelectedArticleFragments = {
        selectedArticleFragments: {
          frontId: { id: 'articleFragmentId', isSupporting: false }
        }
      } as any;
      it("should not clear the article fragment selection when selected article fragments aren't in the front", () => {
        const state = reducer(
          stateWithSelectedArticleFragments,
          removeGroupArticleFragment('collectionId', 'anotherArticleFragmentId')
        );
        expect(state.editor).toBe(stateWithSelectedArticleFragments);
      });
      it('should clear the article fragment selection when selected supporting article fragments are removed from a front', () => {
        const state = reducer(
          stateWithSelectedArticleFragments,
          removeSupportingArticleFragment('collectionId', 'articleFragmentId')
        );
        expect(state.editor.selectedArticleFragments.frontId).toBe(undefined);
      });
      it("should not clear the article fragment selection when selected supporting article fragments aren't in the front", () => {
        const state = reducer(
          stateWithSelectedArticleFragments,
          removeSupportingArticleFragment(
            'collectionId',
            'anotherArticleFragmentId'
          )
        );
        expect(state.editor).toBe(stateWithSelectedArticleFragments);
      });
      it('should clear the article fragment selection when selected clipboard article fragments are removed from a front', () => {
        const state = reducer(
          stateWithSelectedArticleFragments,
          removeClipboardArticleFragment('collectionId', 'articleFragmentId')
        );
        expect(state.editor.selectedArticleFragments.frontId).toBe(undefined);
      });
      it("should not clear the article fragment selection when selected clipboard article fragments aren't in the front", () => {
        const state = reducer(
          stateWithSelectedArticleFragments,
          removeClipboardArticleFragment(
            'collectionId',
            'anotherArticleFragmentId'
          )
        );
        expect(state.editor).toBe(stateWithSelectedArticleFragments);
      });
    });
    it('should set the fronts to the open editor fronts', () => {
      const state = reducer(
        { frontIds: ['front1', 'front2'] } as any,
        editorSetOpenFronts(['front1', 'front3'])
      );
      expect(selectEditorFrontIds(state)).toEqual(['front1', 'front3']);
    });
    it('should add a collection to the open editor collections', () => {
      const state = reducer(undefined, editorOpenCollections(
        'exampleCollection'
      ) as any);
      expect(selectIsCollectionOpen(state, 'exampleCollection')).toBe(true);
    });
    it('should add multiple collections to the open editor collections', () => {
      const state = reducer(undefined, editorOpenCollections([
        'exampleCollection',
        'exampleCollection2'
      ]) as any);
      expect(selectIsCollectionOpen(state, 'exampleCollection')).toBe(true);
      expect(selectIsCollectionOpen(state, 'exampleCollection2')).toBe(true);
    });
    it('should remove multiple collections from the open editor collections', () => {
      const state = reducer(
        { collectionIds: ['collection1', 'collection2'] } as any,
        editorCloseCollections(['collection1', 'collection2'])
      );
      expect(selectIsCollectionOpen(state, 'collection1')).toBe(false);
      expect(selectIsCollectionOpen(state, 'collection1')).toBe(false);
    });
    it('should open and close a front overview', () => {
      const state = reducer(
        { closedOverviews: [] } as any,
        editorCloseOverview('front1')
      );
      expect(selectIsFrontOverviewOpen(state, 'front1')).toBe(false);
      expect(selectIsFrontOverviewOpen(state, 'front2')).toBe(true);
      const state2 = reducer(state.editor, editorOpenOverview('front1'));
      expect(selectIsFrontOverviewOpen(state2, 'front1')).toBe(true);
      expect(selectIsFrontOverviewOpen(state2, 'front2')).toBe(true);
    });
    it('should open and close all editing fronts', () => {
      const state = reducer(
        { closedOverviews: [], frontIds: ['front1', 'front2'] } as any,
        editorCloseAllOverviews()
      );
      expect(selectIsFrontOverviewOpen(state, 'front1')).toBe(false);
      expect(selectIsFrontOverviewOpen(state, 'front2')).toBe(false);
      const state2 = reducer(state.editor, editorOpenAllOverviews());
      expect(selectIsFrontOverviewOpen(state2, 'front1')).toBe(true);
      expect(selectIsFrontOverviewOpen(state2, 'front2')).toBe(true);
    });
    it('should open and close the clipboard', () => {
      const state = reducer(
        { clipboardOpen: true } as any,
        editorCloseClipboard()
      );
      expect(selectIsClipboardOpen(state)).toBe(false);
      const state2 = reducer(state.editor, editorOpenClipboard());
      expect(selectIsClipboardOpen(state2)).toBe(true);
    });
  });
});
