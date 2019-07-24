import { reducer } from '../reducer';
import { actionSetFeatureValue } from '../actions';

describe('Feature reducer', () => {
  it('should set feature switch values', () => {
    const feature = {
      key: 'exampleFeature',
      title: 'Feature title',
      enabled: true
    };
    const action = actionSetFeatureValue(feature);
    const newState = reducer(undefined, action);
    expect(newState.exampleFeature).toEqual(feature);
  });
});
