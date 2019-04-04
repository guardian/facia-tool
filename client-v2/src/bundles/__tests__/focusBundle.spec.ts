import { reducer, setFocusState } from "../focusBundle";

describe('focusBundle', () => {
  describe('reducer', () => {
    it('should replace the focus state', () => {
      expect(
        reducer(undefined, setFocusState({ type: "article" }))
      ).toEqual({ focusState: { type: "article" }})
    })
  })
});
