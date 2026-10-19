import React from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render, cleanup, wait } from 'react-testing-library';
import { ThemeProvider } from 'styled-components';
import { theme } from 'constants/theme';
import configureStore from 'util/configureStore';
import { state as initialState } from 'fixtures/initialState';
import { Test, VariantMeta } from 'types/Collection';
import { State } from 'types/State';
import ArticleMetaForm from '../ArticleMetaForm';
import { FUTURE, makeTest } from '../../../fixtures/abTests';

const variantMeta: VariantMeta[] = [
	{ id: 'A', meta: { headline: 'Headline A variant' } },
	{ id: 'B', meta: { headline: 'Headline B variant' } },
];

afterEach(cleanup);

const cardId = 'exampleId';

const getStateWithTestOnExampleCard = (test: Test): State => ({
	...initialState,
	cards: {
		...initialState.cards,
		[cardId]: {
			...initialState.cards[cardId],
			tests: [test],
		},
	},
});

const renderForm = (state: State) => {
	const store = configureStore(state);
	return {
		store,
		...render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<ArticleMetaForm
						cardId={cardId}
						form={cardId}
						frontId="us"
						onSave={jest.fn()}
						onCancel={jest.fn()}
					/>
				</ThemeProvider>
			</Provider>,
		),
	};
};

describe('ArticleMetaForm - headline AB testing', () => {
	it('copies the card headline into headlineA when the AB test toggle is switched on', () => {
		const store = configureStore(initialState);

		const { getByTestId } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<ArticleMetaForm
						cardId={cardId}
						form={cardId}
						frontId="us"
						onSave={jest.fn()}
						onCancel={jest.fn()}
					/>
				</ThemeProvider>
			</Provider>,
		);

		const abTestToggle = getByTestId(
			'edit-form-ab-test-toggle',
		) as HTMLInputElement;
		expect(abTestToggle.checked).toBe(false);
		// headlineA is an empty string by default, we transform it to undefined later using getStringField
		expect(store.getState().form[cardId]?.values?.headlineA).toBe('');

		fireEvent.click(abTestToggle);

		expect(abTestToggle.checked).toBe(true);
		expect(store.getState().form[cardId]?.values?.headlineA).toBe(
			'Bill Shorten',
		);

		const headlineAField = getByTestId(
			'edit-form-headline-a-field',
		) as HTMLTextAreaElement;
		expect(headlineAField.value).toBe('Bill Shorten');
	});

	it('disables the Headline A & Headline B input when the card has an active launched test', () => {
		const launchedTest = makeTest({
			variantMeta,
			expiryDate: FUTURE,
		});

		const { getByTestId } = renderForm(
			getStateWithTestOnExampleCard(launchedTest),
		);

		const headlineAField = getByTestId(
			'edit-form-headline-a-field',
		) as HTMLTextAreaElement;
		const headlineBField = getByTestId(
			'edit-form-headline-b-field',
		) as HTMLTextAreaElement;

		expect(headlineAField.disabled).toBe(true);
		expect(headlineBField.disabled).toBe(true);
	});

	it('does not disable the Headline A & Headline B input when the card only has a draft test', () => {
		// A draft test has no expiryDate, so it is not considered launched
		const draftTest = makeTest({ variantMeta });

		const { getByTestId } = renderForm(
			getStateWithTestOnExampleCard(draftTest),
		);

		const headlineAField = getByTestId(
			'edit-form-headline-a-field',
		) as HTMLTextAreaElement;
		const headlineBField = getByTestId(
			'edit-form-headline-b-field',
		) as HTMLTextAreaElement;

		expect(headlineAField.disabled).toBe(false);
		expect(headlineBField.disabled).toBe(false);
	});
});

describe('ArticleMetaForm - multimedia slideshow', () => {
	const slideshowUrl =
		'https://content.code.dev-guardianapis.com/atom/multimediaslideshow/slideshow-1';
	const slideshowAtom = {
		id: 'slideshow-1',
		atomType: 'multimediaslideshow',
		data: {
			multimediaSlideshow: {
				slides: [
					{ content: { image: { assets: [], master: { file: 'first.jpg' } } } },
				],
			},
		},
	};

	const getStateWithSlideshowCard = (meta: Record<string, unknown>): State =>
		({
			...initialState,
			featureSwitches: {
				'multimedia-slideshow': {
					key: 'multimedia-slideshow',
					title: 'Multimedia slideshow',
					enabled: true,
				},
			},
			cards: {
				...initialState.cards,
				[cardId]: {
					...initialState.cards[cardId],
					meta: {
						...initialState.cards[cardId].meta,
						multimediaSlideshowReplace: true,
						...meta,
					},
				},
			},
		}) as State;

	const formValues = (store: ReturnType<typeof configureStore>) =>
		(store.getState() as any).form[cardId].values;

	beforeEach(() => {
		(global as any).fetch = jest.fn().mockResolvedValue({
			json: () =>
				Promise.resolve({
					response: { status: 'ok', multimediaslideshow: slideshowAtom },
				}),
		});
	});

	it('fetches the slideshow using the atom id from a pasted URL', async () => {
		const { store, getByTestId } = renderForm(getStateWithSlideshowCard({}));

		fireEvent.change(getByTestId('multimedia-slideshow-url'), {
			target: { value: slideshowUrl },
		});

		expect(formValues(store).multimediaSlideshowAtomId).toBe(
			'atom/multimediaslideshow/slideshow-1',
		);
		await wait(() =>
			expect(formValues(store).multimediaSlideshowAtom).toEqual(slideshowAtom),
		);
		expect((global as any).fetch).toHaveBeenCalledWith(
			'/api/live/atom/multimediaslideshow/slideshow-1',
		);
	});

	it('derives the atom id from the saved URL for cards saved without one', async () => {
		const { store } = renderForm(
			getStateWithSlideshowCard({ multimediaSlideshowUrl: slideshowUrl }),
		);

		await wait(() =>
			expect(formValues(store).multimediaSlideshowAtom).toEqual(slideshowAtom),
		);
		expect(formValues(store).multimediaSlideshowAtomId).toBe(
			'atom/multimediaslideshow/slideshow-1',
		);
	});
});
