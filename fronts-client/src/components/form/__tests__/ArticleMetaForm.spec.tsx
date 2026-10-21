import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import 'jest-styled-components';
import { Provider } from 'react-redux';
import { fireEvent, render, cleanup } from 'react-testing-library';
import { ThemeProvider } from 'styled-components';
import { theme } from 'constants/theme';
import configureStore from 'util/configureStore';
import { state as initialState } from 'fixtures/initialState';
import { CardMeta, Test, VariantMeta } from 'types/Collection';
import { State } from 'types/State';
import ArticleMetaForm from '../ArticleMetaForm';
import { FUTURE, makeTest } from '../../../fixtures/abTests';
import { error } from '../../../styleConstants';

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

const renderForm = (state: State, onSave = jest.fn()) => {
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
						onSave={onSave}
						onCancel={jest.fn()}
					/>
				</ThemeProvider>
			</Provider>,
		),
	};
};

describe('ArticleMetaForm - mini nav', () => {
	const getMiniNavState = (
		meta: CardMeta = {},
		collectionType = 'flexible/general',
	): State => {
		const state = cloneDeep(initialState);
		const collectionId = 'e59785e9-ba82-48d8-b79a-0a80b2f9f808';
		state.groups.group123.cards = [cardId];
		state.collections.data[collectionId].id = collectionId;
		state.fronts.frontsConfig.data.collections[collectionId].type =
			collectionType;
		state.cards[cardId].meta = { ...state.cards[cardId].meta, ...meta };
		return state;
	};

	it('is off by default and reveals an empty text input when enabled', () => {
		const { getByLabelText, queryByLabelText } = renderForm(getMiniNavState());
		const toggle = getByLabelText('Enable mini nav') as HTMLInputElement;
		expect(toggle.checked).toBe(false);
		expect(queryByLabelText('Custom nav URL')).toBeNull();

		fireEvent.click(toggle);

		const input = getByLabelText('Custom nav URL') as HTMLInputElement;
		expect(input.value).toBe('');
		expect(input.type).toBe('text');
	});

	it('shows an associated red warning for entered text and removes it when cleared', () => {
		const { getByLabelText, getByText, queryByText } = renderForm(
			getMiniNavState({ showMiniNav: true }),
		);
		const input = getByLabelText('Custom nav URL');
		expect(queryByText('Not implimented')).toBeNull();

		fireEvent.change(input, { target: { value: 'not a valid URL' } });

		const warning = getByText('Not implimented');
		expect(warning).toHaveStyleRule('color', error.primary);
		expect(input.getAttribute('aria-describedby')).toBe(warning.id);

		fireEvent.change(input, { target: { value: '' } });

		expect(queryByText('Not implimented')).toBeNull();
		expect(input.hasAttribute('aria-describedby')).toBe(false);
	});

	it('retains the URL when disabled and restores it when re-enabled', () => {
		const { getByLabelText, queryByLabelText, queryByText } =
			renderForm(getMiniNavState());
		const toggle = getByLabelText('Enable mini nav');
		fireEvent.click(toggle);
		fireEvent.change(getByLabelText('Custom nav URL'), {
			target: { value: 'https://www.theguardian.com/custom-nav' },
		});

		fireEvent.click(toggle);
		expect(queryByLabelText('Custom nav URL')).toBeNull();
		expect(queryByText('Not implimented')).toBeNull();

		fireEvent.click(toggle);
		expect((getByLabelText('Custom nav URL') as HTMLInputElement).value).toBe(
			'https://www.theguardian.com/custom-nav',
		);
	});

	it('allows saving entered text despite the not implemented warning', () => {
		const onSave = jest.fn();
		const { getByLabelText, getByTestId, getByText } = renderForm(
			getMiniNavState(),
			onSave,
		);
		fireEvent.click(getByLabelText('Enable mini nav'));
		fireEvent.change(getByLabelText('Custom nav URL'), {
			target: { value: 'not a valid URL' },
		});
		expect(getByText('Not implimented')).toBeTruthy();

		fireEvent.click(getByTestId('edit-form-save-button'));

		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({
				showMiniNav: true,
				miniNavUrl: 'not a valid URL',
			}),
			undefined,
		);
	});

	it('restores enabled settings when the form is opened', () => {
		const { getByLabelText, getByText } = renderForm(
			getMiniNavState({
				showMiniNav: true,
				miniNavUrl: 'https://www.theguardian.com/custom-nav',
			}),
		);
		expect(
			(getByLabelText('Enable mini nav') as HTMLInputElement).checked,
		).toBe(true);
		expect((getByLabelText('Custom nav URL') as HTMLInputElement).value).toBe(
			'https://www.theguardian.com/custom-nav',
		);
		expect(getByText('Not implimented')).toBeTruthy();
	});

	it.each(['flexible/special', 'dynamic/slow'])(
		'hides both controls and the warning in %s even with existing settings',
		(collectionType) => {
			const { queryByLabelText, queryByText } = renderForm(
				getMiniNavState(
					{
						showMiniNav: true,
						miniNavUrl: 'https://www.theguardian.com/custom-nav',
					},
					collectionType,
				),
			);
			expect(queryByLabelText('Enable mini nav')).toBeNull();
			expect(queryByLabelText('Custom nav URL')).toBeNull();
			expect(queryByText('Not implimented')).toBeNull();
		},
	);
});

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
