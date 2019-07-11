import cloneDeep from 'lodash/cloneDeep';
import {
  createSelectFormFieldsForCollectionItem,
  defaultFields,
  supportingFields
} from '../formSelectors';
import { state, stateWithVideoArticle } from 'fixtures/form';

describe('Form utils', () => {
  describe('getFormFieldsForCollectionItem', () => {
    it("should handle articles that don't exist in the state", () => {
      const selectFormFields = createSelectFormFieldsForCollectionItem();
      expect(selectFormFields(state as any, 'who-are-you')).toEqual([]);
    });
    it('should give default fields for articles', () => {
      const selectFormFields = createSelectFormFieldsForCollectionItem();
      expect(
        selectFormFields(state as any, '95e2bfc0-8999-4e6e-a359-19960967c1e0')
      ).toEqual(defaultFields);
    });
    it('should give supporting fields for articles in supporting positions', () => {
      const selectFormFields = createSelectFormFieldsForCollectionItem();
      expect(
        selectFormFields(
          state as any,
          '95e2bfc0-8999-4e6e-a359-19960967c1e0',
          true
        )
      ).toEqual(supportingFields);
    });
    it('should add isBoosted for dynamic collection configs', () => {
      const localState = cloneDeep(state);
      localState.fronts.frontsConfig.data.collections.exampleCollection.type =
        'dynamic/example';
      const selectFormFields = createSelectFormFieldsForCollectionItem();
      expect(
        selectFormFields(
          localState as any,
          '95e2bfc0-8999-4e6e-a359-19960967c1e0'
        )
      ).toEqual([...defaultFields, 'isBoosted']);
    });
    it('should add showLivePlayable for live blogs', () => {
      const localState = cloneDeep(state);
      localState.shared.externalArticles.data[
        'article/live/0'
      ].fields.liveBloggingNow = 'true';
      const selectFormFields = createSelectFormFieldsForCollectionItem();
      expect(
        selectFormFields(
          localState as any,
          '95e2bfc0-8999-4e6e-a359-19960967c1e0'
        )
      ).toEqual([...defaultFields, 'showLivePlayable']);
    });
    it('should add showMainVideo for articles with video as the main media', () => {
      const selectFormFields = createSelectFormFieldsForCollectionItem();
      expect(
        selectFormFields(
          stateWithVideoArticle as any,
          '95e2bfc0-8999-4e6e-a359-19960967c1e0'
        )
      ).toEqual([...defaultFields, 'showMainVideo']);
    });
  });
});
