import {
  default as innerReducer,
  editorOpenFront,
  editorCloseFront,
  editorFavouriteFront,
  editorUnfavouriteFront,
  editorSetFavouriteFronts,
  editorClearOpenFronts,
  editorSetOpenFronts,
  editorOpenCollections,
  editorCloseCollections,
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
  createSelectFrontIdWithOpenAndStarredStatesByPriority,
  editorMoveFront,
  selectEditorFrontIds,
  selectEditorFrontIdsByPriority,
  selectEditorFavouriteFrontIds,
  selectEditorFavouriteFrontIdsByPriority,
  editorSelectArticleFragment
} from '../frontsUIBundle';
import initialState from 'fixtures/initialState';
import { Action } from 'types/Action';
import {
  removeSupportingArticleFragment,
  removeGroupArticleFragment
} from 'shared/actions/ArticleFragments';
import { removeClipboardArticleFragment } from 'actions/Clipboard';
import { State as GlobalState } from 'types/State';
import { State as GlobalSharedState } from 'shared/types/State';
import { initialState as initialSharedState } from 'shared/fixtures/shared';

type State = ReturnType<typeof innerReducer>;

// this allows us to put _in_ our own slice of state but receive a _global_
// state so that we can test out selectors
const reducer = (
  state: State | undefined,
  action: Action,
  sharedState: GlobalSharedState
): GlobalState =>
  ({
    editor: innerReducer(state, action, (sharedState = initialSharedState))
  } as any);

describe('frontsUIBundle', () => {
  describe('selectors', () => {
    describe('selectEditorFrontIdsByPriority', () => {
      it('should handle empty priorities', () => {
        expect(
          selectEditorFrontIdsByPriority(initialState, 'editorial')
        ).toEqual([]);
      });
      it('should select priorities', () => {
        const stateWithFronts = {
          editor: {
            ...initialState.editor,
            frontIdsByPriority: { commercial: ['1', '2'] }
          }
        } as any;
        expect(
          selectEditorFrontIdsByPriority(stateWithFronts, 'commercial')
        ).toEqual(['1', '2']);
      });
    });
    describe('createSelectEditorFrontsByPriority', () => {
      const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
      it('should select nothing if nothing is there', () => {
        expect(
          selectEditorFrontsByPriority(initialState, { priority: 'commercial' })
            .length
        ).toEqual(0);
      });
      it('should select editor fronts by priority', () => {
        const stateWithFronts = {
          ...initialState,
          fronts: {
            frontsConfig: {
              data: {
                fronts: {
                  '1': { id: '1', priority: 'commercial' },
                  '2': { id: '2', priority: 'commercial' },
                  '3': { id: '3', priority: 'editorial' }
                }
              }
            }
          },
          editor: {
            ...initialState.editor,
            frontIdsByPriority: { commercial: ['1', '2'] }
          }
        } as any;
        expect(
          selectEditorFrontsByPriority(stateWithFronts, {
            priority: 'commercial'
          })
        ).toEqual([
          { id: '1', priority: 'commercial' },
          { id: '2', priority: 'commercial' }
        ]);
      });
      it('should memoize editor fronts by priority', () => {
        expect(
          selectEditorFrontsByPriority(initialState, { priority: 'commercial' })
        ).toBe(
          selectEditorFrontsByPriority(initialState, { priority: 'commercial' })
        );
      });
    });
    describe('selectEditorFavouriteFrontIdsByPriority', () => {
      it('should handle empty priorities', () => {
        expect(
          selectEditorFavouriteFrontIdsByPriority(initialState, 'editorial')
        ).toEqual([]);
      });
      it('should select priorities', () => {
        const stateWithFronts = {
          editor: {
            ...initialState.editor,
            favouriteFrontIdsByPriority: { commercial: ['1', '2'] }
          }
        } as any;
        expect(
          selectEditorFavouriteFrontIdsByPriority(stateWithFronts, 'commercial')
        ).toEqual(['1', '2']);
      });
    });
  });
  describe('selectEditorFavouriteFrontIdsByPriority', () => {
    it('should handle empty priorities', () => {
      expect(
        selectEditorFavouriteFrontIdsByPriority(initialState, 'editorial')
      ).toEqual([]);
    });
    it('should select priorities', () => {
      const stateWithFronts = {
        editor: {
          ...initialState.editor,
          favouriteFrontIdsByPriority: { commercial: ['1', '2'] }
        }
      } as any;
      expect(
        selectEditorFavouriteFrontIdsByPriority(stateWithFronts, 'commercial')
      ).toEqual(['1', '2']);
    });
  });
  describe('createSelectFrontIdWithOpenAndStarredStatesByPriority', () => {
    const stateWithEditorFronts = {
      ...initialState,
      editor: {
        ...initialState.editor,
        frontIdsByPriority: {
          commercial: ['sc-johnson-partner-zone', 'a-shot-of-sustainability']
        },
        favouriteFrontIdsByPriority: {
          commercial: [
            'sc-johnson-partner-zone',
            'un-global-compact-partner-zone'
          ]
        }
      }
    } as any;
    const selectFrontIdWithOpenAndStarredStatesByPriority = createSelectFrontIdWithOpenAndStarredStatesByPriority();
    it('should select all fronts by priority', () => {
      expect(
        selectFrontIdWithOpenAndStarredStatesByPriority(
          initialState,
          'commercial'
        )
      ).toHaveLength(4);
    });
    it('should add correct Open State meta data', () => {
      expect(
        selectFrontIdWithOpenAndStarredStatesByPriority(
          stateWithEditorFronts,
          'commercial'
        )
      ).toEqual([
        {
          id: 'a-shot-of-sustainability',
          displayName: undefined,
          index: 1,
          isOpen: true,
          isStarred: false
        },
        {
          id: 'sc-johnson-partner-zone',
          displayName: undefined,
          index: 0,
          isOpen: true,
          isStarred: true
        },
        {
          id: 'sustainable-business/fairtrade-partner-zone',
          isOpen: false,
          isStarred: false,
          displayName: undefined,
          index: 2
        },
        {
          id: 'un-global-compact-partner-zone',
          isOpen: false,
          isStarred: true,
          displayName: undefined,
          index: 3
        }
      ]);
    });
    it('should sort fronts by id and name', () => {
      expect(
        selectFrontIdWithOpenAndStarredStatesByPriority(
          stateWithEditorFronts,
          'commercial',
          'id'
        ).map(_ => _.id)
      ).toEqual([
        'a-shot-of-sustainability',
        'sc-johnson-partner-zone',
        'sustainable-business/fairtrade-partner-zone',
        'un-global-compact-partner-zone'
      ]);
      expect(
        selectFrontIdWithOpenAndStarredStatesByPriority(
          stateWithEditorFronts,
          'commercial',
          'index'
        ).map(_ => _.index)
      ).toEqual([0, 1, 2, 3]);
    });
  });

  describe('reducer', () => {
    it('should move a front within the open editor fronts by ID', () => {
      const state = {
        ...initialState.editor,
        frontIdsByPriority: { editorial: ['1', '2', '3'] }
      };
      const newState = reducer(state as any, editorMoveFront('3', 0));
      expect(selectEditorFrontIds(newState)).toEqual({
        editorial: ['3', '1', '2']
      });
    });
    it('should do nothing when the front is not found', () => {
      const state = {
        ...initialState.editor,
        frontIdsByPriority: { editorial: ['1', '2', '3'] }
      };
      const newState = reducer(state as any, editorMoveFront('who?', 0));
      expect(selectEditorFrontIds(newState)).toEqual({
        editorial: ['1', '2', '3']
      });
    });
    it('should do nothing when the index is out of bounds', () => {
      const state = {
        ...initialState.editor,
        frontIdsByPriority: { editorial: ['1', '2', '3'] }
      };
      const newState = reducer(
        state,
        editorMoveFront('sc-johnson-partner-zone', 5)
      );
      expect(selectEditorFrontIds(newState)).toEqual({
        editorial: ['1', '2', '3']
      });
    });
    it('should add a front to the open editor fronts', () => {
      const state = reducer(undefined, editorOpenFront(
        'exampleFront',
        'editorial'
      ) as any);
      expect(selectEditorFrontIds(state)).toEqual({
        editorial: ['exampleFront']
      });
    });
    it('should remove a front to the open editor fronts', () => {
      const state = reducer(
        { frontIdsByPriority: { editorial: ['front1', 'front2'] } } as any,
        editorCloseFront('front1')
      );
      expect(selectEditorFrontIds(state)).toEqual({
        editorial: ['front2']
      });
    });
    it('should clear fronts to the open editor fronts', () => {
      const state = reducer(
        { frontIds: ['front1', 'front2'] } as any,
        editorClearOpenFronts()
      );
      expect(selectEditorFrontIds(state)).toEqual({});
    });

    it('should add a front to the favourite editor fronts', () => {
      const state = reducer(undefined, editorFavouriteFront(
        'exampleFront',
        'editorial'
      ) as any);
      expect(selectEditorFavouriteFrontIds(state)).toEqual({
        editorial: ['exampleFront']
      });
    });

    it('should remove a front to the favourite editor fronts', () => {
      const state = reducer(
        {
          favouriteFrontIdsByPriority: {
            editorial: ['front1', 'front2'],
            training: ['front1', 'front2']
          }
        } as any,
        editorUnfavouriteFront('front1', 'editorial')
      );
      expect(selectEditorFavouriteFrontIds(state)).toEqual({
        editorial: ['front2'],
        training: ['front1', 'front2']
      });
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
        editorSetOpenFronts({ editorial: ['front1', 'front3'] })
      );
      expect(selectEditorFrontIds(state)).toEqual({
        editorial: ['front1', 'front3']
      });
    });
    it('should set the fave fronts from config to the fave fronts in editor', () => {
      const state = reducer(
        {
          frontIdsByPriority: {
            editorial: ['front1', 'front2']
          }
        } as any,
        editorSetFavouriteFronts({ editorial: ['front1', 'front3'] })
      );
      expect(selectEditorFavouriteFrontIds(state)).toEqual({
        editorial: ['front1', 'front3']
      });
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
    describe('Front overviews', () => {
      it('should open and close a front overview', () => {
        let state = reducer(
          { closedOverviews: [] } as any,
          editorCloseOverview('front1')
        );
        expect(selectIsFrontOverviewOpen(state, 'front1')).toBe(false);
        expect(selectIsFrontOverviewOpen(state, 'front2')).toBe(true);
        state = reducer(state.editor, editorOpenOverview('front1'));
        expect(selectIsFrontOverviewOpen(state, 'front1')).toBe(true);
        expect(selectIsFrontOverviewOpen(state, 'front2')).toBe(true);
      });
    });
    describe('Collection item form display', () => {
      it('should open a collection item form', () => {
        const state = reducer(
          undefined,
          editorSelectArticleFragment('front1', 'exampleArticleFragment')
        );
        expect(selectEditorArticleFragment(state, 'front1')).toEqual({
          id: 'exampleArticleFragment',
          isSupporting: false
        });
      });
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
