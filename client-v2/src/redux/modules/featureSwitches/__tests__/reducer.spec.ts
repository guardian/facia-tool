import reducer from '../reducer';
import { actionSetFeatureValue } from '../actions';

describe('Feature reducer', () => {
  it('should set feature switch values', () => {
    const action = actionSetFeatureValue('exampleFeature', true);
    const newState = reducer(undefined, action);
    expect(newState.exampleFeature).toBe(true);
  });
});
