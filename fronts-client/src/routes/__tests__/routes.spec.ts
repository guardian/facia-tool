import {
	matchFrontsEditPath,
	FrontsEditParams,
	matchIssuePath,
} from 'routes/routes';

describe('Routes', () => {
	describe('matchFrontsEditPath', () => {
		it('correctly returns the right types of parameters', () => {
			// using types here also checks the typings
			expect(matchFrontsEditPath('/editorial')!.params).toEqual({
				priority: 'editorial',
			});
		});

		it('has typings that are in sync with the actual return type', () => {
			const params: FrontsEditParams = {
				priority: 'editorial',
			};
			expect(matchFrontsEditPath('/editorial')!.params).toEqual(params);
		});

		it('does not match sub paths', () => {
			const match = matchFrontsEditPath('/editorial/test');
			expect(match).toBe(null);
		});

		it("ignores priorities that don't exist ", () => {
			const match = matchFrontsEditPath('/none');
			expect(match).toBe(null);
		});
	});

	describe('matchIssuePath', () => {
		it('correctly returns the right types of parameters', () => {
			expect(matchIssuePath('/issues/a')!.params).toEqual({
				priority: 'a',
			});
		});

		it('has typings that are in sync with the actual return type', () => {
			const params: FrontsEditParams = {
				priority: 'a',
			};
			expect(matchIssuePath('/issues/a')!.params).toEqual(params);
		});

		it('does not match sub paths', () => {
			const match = matchFrontsEditPath('/issues/a/test');
			expect(match).toBe(null);
		});
	});
});
